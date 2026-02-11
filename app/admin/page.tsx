'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TableInfo {
    name: string;
    rowCount: number;
    columns: {
        name: string;
        type: string;
        isPrimaryKey: boolean;
        notNull: boolean;
        defaultValue: string | null;
    }[];
}

interface TableData {
    table: string;
    columns: string[];
    columnTypes: Record<string, string>;
    rows: Record<string, unknown>[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function AdminPage() {
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<TableData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Raw SQL query state
    const [sqlQuery, setSqlQuery] = useState('');
    const [sqlResult, setSqlResult] = useState<{ result: unknown[]; rowCount: number } | null>(null);
    const [sqlError, setSqlError] = useState<string | null>(null);
    const [sqlLoading, setSqlLoading] = useState(false);

    // Fetch table list
    useEffect(() => {
        fetch('/api/admin/tables')
            .then(res => res.json())
            .then(data => {
                setTables(data.tables || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Fetch table data when selected
    useEffect(() => {
        if (!selectedTable) {
            setTableData(null);
            return;
        }

        setLoading(true);
        setExpandedRows(new Set());
        fetch(`/api/admin/tables?table=${selectedTable}&page=${page}`)
            .then(res => res.json())
            .then(data => {
                setTableData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [selectedTable, page]);

    const toggleRowExpand = (index: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRows(newExpanded);
    };

    const formatValue = (value: unknown, type: string): string => {
        if (value === null || value === undefined) return 'NULL';
        if (type.toLowerCase().includes('timestamp') && typeof value === 'number') {
            return new Date(value * 1000).toLocaleString();
        }
        if (typeof value === 'object') return JSON.stringify(value);
        const str = String(value);
        if (str.length > 100) return str.substring(0, 100) + '...';
        return str;
    };

    const isLongValue = (value: unknown): boolean => {
        if (value === null || value === undefined) return false;
        const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return str.length > 100;
    };

    const executeSql = async () => {
        if (!sqlQuery.trim()) return;

        setSqlLoading(true);
        setSqlError(null);
        setSqlResult(null);

        try {
            const res = await fetch('/api/admin/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: sqlQuery })
            });
            const data = await res.json();

            if (data.error) {
                setSqlError(data.error);
            } else {
                setSqlResult(data);
            }
        } catch (err) {
            setSqlError(err instanceof Error ? err.message : 'Query failed');
        } finally {
            setSqlLoading(false);
        }
    };

    if (loading && tables.length === 0) {
        return (
            <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center">
                <div className="text-gray-400">Loading database info...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 text-white">
            {/* Header */}
            <div className="bg-dark-800/80 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-accent-400 hover:text-accent-300 transition">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Home
                        </Link>
                        <span className="text-gray-600">|</span>
                        <h1 className="text-xl font-semibold">Database Admin</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        {tables.length} tables
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar - Table List */}
                    <div className="col-span-3">
                        <div className="bg-dark-800 border border-white/5 rounded-xl p-4">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Tables</h2>
                            <div className="space-y-1">
                                {tables.map(table => (
                                    <button
                                        key={table.name}
                                        onClick={() => {
                                            setSelectedTable(table.name);
                                            setPage(1);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                                            selectedTable === table.name
                                                ? 'bg-accent-900/50 text-white'
                                                : 'hover:bg-white/5 text-gray-400'
                                        }`}
                                    >
                                        <span className="font-mono text-sm">{table.name}</span>
                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                                            {table.rowCount}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected Table Schema */}
                        {selectedTable && (
                            <div className="mt-4 bg-dark-800 border border-white/5 rounded-xl p-4">
                                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Schema</h2>
                                <div className="space-y-2 text-sm">
                                    {tables.find(t => t.name === selectedTable)?.columns.map(col => (
                                        <div key={col.name} className="flex items-center gap-2 font-mono">
                                            {col.isPrimaryKey && (
                                                <span className="text-yellow-500 text-xs">PK</span>
                                            )}
                                            <span className="text-white">{col.name}</span>
                                            <span className="text-gray-600">{col.type}</span>
                                            {col.notNull && <span className="text-red-400 text-xs">NN</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="col-span-9">
                        {!selectedTable ? (
                            <div className="bg-dark-800 border border-white/5 rounded-xl p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold mb-2">Select a Table</h2>
                                <p className="text-gray-500">Choose a table from the sidebar to view its data</p>
                            </div>
                        ) : loading ? (
                            <div className="bg-dark-800 border border-white/5 rounded-xl p-8 text-center">
                                <div className="text-gray-400">Loading table data...</div>
                            </div>
                        ) : tableData ? (
                            <div className="bg-dark-800 border border-white/5 rounded-xl overflow-hidden">
                                {/* Table Header */}
                                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold font-mono">{tableData.table}</h2>
                                        <p className="text-sm text-gray-500">
                                            {tableData.pagination.total} rows total
                                        </p>
                                    </div>
                                    {/* Pagination */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-3 py-1 text-sm bg-white/5 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Prev
                                        </button>
                                        <span className="text-sm text-gray-400">
                                            Page {tableData.pagination.page} of {tableData.pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(tableData.pagination.totalPages, p + 1))}
                                            disabled={page >= tableData.pagination.totalPages}
                                            className="px-3 py-1 text-sm bg-white/5 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>

                                {/* Data Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-white/5">
                                                <th className="px-4 py-2 text-left text-gray-400 font-medium w-8">#</th>
                                                {tableData.columns.map(col => (
                                                    <th key={col} className="px-4 py-2 text-left text-gray-400 font-medium font-mono">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.rows.map((row, idx) => (
                                                <>
                                                    <tr
                                                        key={idx}
                                                        className="border-t border-white/5 hover:bg-white/5 cursor-pointer"
                                                        onClick={() => toggleRowExpand(idx)}
                                                    >
                                                        <td className="px-4 py-2 text-gray-600">{(page - 1) * 50 + idx + 1}</td>
                                                        {tableData.columns.map(col => (
                                                            <td key={col} className="px-4 py-2 font-mono">
                                                                <span className={isLongValue(row[col]) ? 'text-accent-400' : ''}>
                                                                    {formatValue(row[col], tableData.columnTypes[col] || '')}
                                                                </span>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    {expandedRows.has(idx) && (
                                                        <tr key={`${idx}-expanded`} className="bg-dark-900">
                                                            <td colSpan={tableData.columns.length + 1} className="px-4 py-4">
                                                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-black/30 p-4 rounded-lg">
                                                                    {JSON.stringify(row, null, 2)}
                                                                </pre>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {tableData.rows.length === 0 && (
                                    <div className="px-4 py-8 text-center text-gray-500">
                                        No data in this table
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* Raw SQL Query */}
                        <div className="mt-6 bg-dark-800 border border-white/5 rounded-xl p-4">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Raw SQL Query</h2>
                            <div className="space-y-4">
                                <textarea
                                    value={sqlQuery}
                                    onChange={e => setSqlQuery(e.target.value)}
                                    placeholder="SELECT * FROM subscribers LIMIT 10"
                                    className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-accent-900/50 resize-none"
                                />
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={executeSql}
                                        disabled={sqlLoading || !sqlQuery.trim()}
                                        className="px-4 py-2 bg-accent-900 hover:bg-accent-800 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {sqlLoading ? 'Running...' : 'Execute'}
                                    </button>
                                    <span className="text-xs text-gray-500">Only SELECT queries allowed</span>
                                </div>

                                {sqlError && (
                                    <div className="p-3 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
                                        {sqlError}
                                    </div>
                                )}

                                {sqlResult && (
                                    <div className="bg-black/30 rounded-lg overflow-hidden">
                                        <div className="px-3 py-2 border-b border-white/5 text-sm text-gray-400">
                                            {sqlResult.rowCount} rows returned
                                        </div>
                                        <pre className="p-4 text-xs overflow-x-auto max-h-96">
                                            {JSON.stringify(sqlResult.result, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
