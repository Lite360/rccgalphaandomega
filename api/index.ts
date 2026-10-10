import type { VercelRequest, VercelResponse } from " @vercel/node\;
import { handleApiRoute } from \../server/api/routes\;

export default async function handler(req: VercelRequest, res: VercelResponse) {
 try {
 const response = await handleApiRoute({
 method: req.method || \GET\,
 url: req.url || \/\,
 body: req.body,
 headers: req.headers as any,
 });
 res.status(response.statusCode).json(response.body);
 } catch (err: any) {
 res.status(500).json({ success: false, error: err.message || \Internal Server Error\ });
 }
}
