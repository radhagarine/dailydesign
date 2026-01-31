interface ComparisonRow {
    aspect: string;
    bad: string;
    good: string;
    best: string;
}

interface ComparisonTableProps {
    rows: ComparisonRow[];
}

export default function ComparisonTable({ rows }: ComparisonTableProps) {
    return (
        <div className="comparison-table-container">
            <h3 className="comparison-table-title">📊 Approach Comparison</h3>
            <div className="comparison-table-wrapper">
                <table className="comparison-table">
                    <thead>
                        <tr>
                            <th className="comparison-th aspect">Aspect</th>
                            <th className="comparison-th bad">🔴 Bad</th>
                            <th className="comparison-th good">🟡 Good</th>
                            <th className="comparison-th best">🟢 Best</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <td className="comparison-td aspect">{row.aspect}</td>
                                <td className="comparison-td bad">{row.bad}</td>
                                <td className="comparison-td good">{row.good}</td>
                                <td className="comparison-td best">{row.best}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
