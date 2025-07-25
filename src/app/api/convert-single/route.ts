import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("image") as File;
        const fileName = formData.get("fileName") as string;

        if (!file) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const webpBuffer = await sharp(buffer).webp().toBuffer();
        const originalName = fileName || file.name.split('.')[0];

        return new NextResponse(webpBuffer, {
            status: 200,
            headers: {
                "Content-Type": "image/webp",
                "Content-Disposition": `attachment; filename="${originalName}.webp"`,
            },
        });
    } catch (error) {
        console.error("Conversion error:", error);
        return NextResponse.json({ error: "Failed to convert image" }, { status: 500 });
    }
}
