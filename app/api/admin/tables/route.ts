import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

// Direct SQLite access for admin queries
const sqlite = new Database('sqlite.db');

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const table = searchParams.get('table');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    try {
        if (!table) {
            // Return list of all tables with row counts
            const tables = sqlite.prepare(`
                SELECT name FROM sqlite_master
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            `).all() as { name: string }[];

            const tableInfo = tables.map(t => {
                const count = sqlite.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get() as { count: number };
                const columns = sqlite.prepare(`PRAGMA table_info("${t.name}")`).all() as {
                    cid: number;
                    name: string;
                    type: string;
                    notnull: number;
                    dflt_value: string | null;
                    pk: number;
                }[];
                return {
                    name: t.name,
                    rowCount: count.count,
                    columns: columns.map(c => ({
                        name: c.name,
                        type: c.type,
                        isPrimaryKey: c.pk === 1,
                        notNull: c.notnull === 1,
                        defaultValue: c.dflt_value
                    }))
                };
            });

            return NextResponse.json({ tables: tableInfo });
        }

        // Validate table name (prevent SQL injection)
        const validTables = sqlite.prepare(`
            SELECT name FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all() as { name: string }[];

        if (!validTables.some(t => t.name === table)) {
            return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
        }

        // Get table data
        const rows = sqlite.prepare(`SELECT * FROM "${table}" LIMIT ? OFFSET ?`).all(limit, offset);
        const totalCount = sqlite.prepare(`SELECT COUNT(*) as count FROM "${table}"`).get() as { count: number };
        const columns = sqlite.prepare(`PRAGMA table_info("${table}")`).all() as {
            name: string;
            type: string;
        }[];

        return NextResponse.json({
            table,
            columns: columns.map(c => c.name),
            columnTypes: columns.reduce((acc, c) => ({ ...acc, [c.name]: c.type }), {}),
            rows,
            pagination: {
                page,
                limit,
                total: totalCount.count,
                totalPages: Math.ceil(totalCount.count / limit)
            }
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

        const result = sqlite.prepare(sql).all();
        return NextResponse.json({ result, rowCount: result.length });
    } catch (error) {
        console.error('SQL execution error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Query execution failed'
        }, { status: 500 });
    }
}
