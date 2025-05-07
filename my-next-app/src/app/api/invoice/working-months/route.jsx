import { getActiveMonthsData } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const queryParams = {
            timeFrame: url.searchParams.get('timeFrame') || undefined,
            startDate: url.searchParams.get('startDate') || undefined,
            endDate: url.searchParams.get('endDate') || undefined
        };

        const result = await getActiveMonthsData(queryParams);
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error("Error fetching active months:", error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                message: error.message 
            }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}