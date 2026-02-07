import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const table = searchParams.get('table');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    try {
        if (!table) {
            // Return list of all tables with row counts
            const tablesResult = await client.execute(`
                SELECT name FROM sqlite_master
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            `);

            const tableInfo = await Promise.all(
                tablesResult.rows.map(async (t) => {
                    const tableName = t.name as string;
                    const countResult = await client.execute({
                        sql: `SELECT COUNT(*) as count FROM "${tableName}"`,
                        args: [],
                    });
                    const columnsResult = await client.execute({
                        sql: `PRAGMA table_info("${tableName}")`,
                        args: [],
                    });
                    return {
                        name: tableName,
                        rowCount: countResult.rows[0].count as number,
                        columns: columnsResult.rows.map((c) => ({
                            name: c.name as string,
                            type: c.type as string,
                            isPrimaryKey: c.pk === 1,
                            notNull: c.notnull === 1,
                            defaultValue: c.dflt_value as string | null,
                        })),
                    };
                })
            );

            return NextResponse.json({ tables: tableInfo });
        }

        // Validate table name (prevent SQL injection)
        const validTables = await client.execute(`
            SELECT name FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `);

        if (!validTables.rows.some((t) => t.name === table)) {
            return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
        }

        // Get table data
        const rows = await client.execute({
            sql: `SELECT * FROM "${table}" LIMIT ? OFFSET ?`,
            args: [limit, offset],
        });
        const totalCount = await client.execute({
            sql: `SELECT COUNT(*) as count FROM "${table}"`,
            args: [],
        });
        const columns = await client.execute({
            sql: `PRAGMA table_info("${table}")`,
            args: [],
        });

        return NextResponse.json({
            table,
            columns: columns.rows.map((c) => c.name as string),
            columnTypes: columns.rows.reduce(
                (acc, c) => ({ ...acc, [c.name as string]: c.type as string }),
                {} as Record<string, string>
            ),
            rows: rows.rows,
            pagination: {
                page,
                limit,
                total: totalCount.rows[0].count as number,
                totalPages: Math.ceil((totalCount.rows[0].count as number) / limit),
            },
        });
    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

// Execute raw SQL (for advanced users)
export async function POST(request: NextRequest) {
    try {
        const { sql } = await request.json();

        if (!sql || typeof sql !== 'string') {
            return NextResponse.json({ error: 'SQL query required' }, { status: 400 });
        }

        // Basic safety check - only allow SELECT for read-only operations
        const trimmedSql = sql.trim().toLowerCase();
        if (!trimmedSql.startsWith('select')) {
            return NextResponse.json({
                error: 'Only SELECT queries are allowed for safety. Use drizzle migrations for writes.'
            }, { status: 400 });
        }

        const result = await client.execute(sql);
        return NextResponse.json({ result: result.rows, rowCount: result.rows.length });
    } catch (error) {
        console.error('SQL execution error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Query execution failed'
        }, { status: 500 });
    }
}
