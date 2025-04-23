import { getProductSalesReport } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const requestWithQuery = {
            ...request,
            query: {
                timeFrame: url.searchParams.get('timeFrame') || undefined,
                startDate: url.searchParams.get('startDate') || undefined,
                endDate: url.searchParams.get('endDate') || undefined
            }
        };
        const salesReport = await getProductSalesReport(requestWithQuery, {
            status: function(statusCode) {
                const response = {
                    json: function(data) {
                        return data;
                    },
                    status: statusCode,
                };
                return response;
            }
        });
        return new Response(JSON.stringify(salesReport), {
            status: 200,
        });
        
    } catch (error) {
        console.error("Error fetching sales report:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}