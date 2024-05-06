import { pipe, map, from } from 'rxjs';
import { formatMoney } from '@/app/conversions'

async function getData() {
    const res = await fetch('http://127.0.0.1:5000/', { cache: 'no-store' })
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
    }

    // const transactions_json = from(fetch('http://127.0.0.1:5000/')).pipe(
    //     map(res => res.json()),
    //     map(json => Object.values(json))
    // )
    // const await_func = transactions_json.subscribe(x => x)
    // return await await_func()

    const transactions_json = await res.json()
    const transactions_list = Object.values(transactions_json)
    transactions_list
        .sort((row1, row2) => Date.parse(row2[0]) - Date.parse(row1[0]))
    transactions_list.forEach(row => row[0] = new Date(row[0]).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }))
    return transactions_list
}

export default async function Page() {
    const data = await getData()
    return (
        <main>
            <h1>Transactions</h1>
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
                    {data.map(row =>
                        <tr>
                            <td className="date-column">{row[0]}</td>
                            <td className="description-column">{row[1]}</td>
                            <td className="money-column">{formatMoney(row[2])}</td>
                            <td>{row[3]}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </main>
    );
}