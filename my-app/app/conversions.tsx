export function formatMoney(raw_amount: string) {
    try {
        const amount = parseFloat(raw_amount)
        // return (amount).toLocaleString()
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    } catch {
        console.log("Error parsing amount")
        return "#ERROR"
    }
    
}