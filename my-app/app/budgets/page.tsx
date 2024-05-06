import { formatMoney } from '@/app/conversions'


async function getDateRange() {
    const res = await fetch('http://127.0.0.1:5000/date-range', { cache: 'no-store' })
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
    }

    const response = await res.json()
    
    const start_date = response[0]
    const end_date = response[1]

    console.log(start_date)
    console.log(end_date)
    
    return [start_date, end_date]
}

async function getTransactions(start_date, end_date) {
    const res = await fetch('http://127.0.0.1:5000/transactions?' + new URLSearchParams({
        start_date: start_date,
        end_date: end_date
    }), { cache: 'no-store' })

    if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
    }

    return await res.json()
}

async function categorizeTransactions(transactions) {
    return {
        "Uncategorized": transactions
    }
}

export default async function Page() {
    const [start_date, end_date] = await getDateRange()
    const transactions = await getTransactions(start_date, end_date)
    const categorizedTransactions = await categorizeTransactions(transactions)
    return (<main>
        Budgets NEXT: we need to make these accordion tabbed to dynamically hide/show, and we need to be able to modify the date range, then start working on rules/different categories
        {start_date}-{end_date}
        {Object.entries(categorizedTransactions).map(([category, transactionsInCategory]) => 
            <div>
                <div>
                    {category}
                </div>
                <table>
                <thead>
                    <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Account</th>
                    </tr>
                </thead>
                <tbody>
                    {transactionsInCategory.map(row =>
                        <tr>
                            <td className="date-column">{row[1]}</td>
                            <td className="description-column">{row[2]}</td>
                            <td className="money-column">{formatMoney(row[3])}</td>
                            <td>{row[3]}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        )}
    </main>);
}