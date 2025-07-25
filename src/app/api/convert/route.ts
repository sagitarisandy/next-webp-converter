import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("images") as File[];

        if (files.length === 0) {
            return NextResponse.json({ error: "No image files provided" }, { status: 400 });
        }

        if (files.length > 10) {
            return NextResponse.json({ error: "Maximum 10 files allowed" }, { status: 400 });
        }

        // Check if single file or multiple files
        if (files.length === 1) {
            // Single file conversion
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const webpBuffer = await sharp(buffer).webp().toBuffer();
            const originalName = file.name.split('.')[0];

            return new NextResponse(webpBuffer, {
                status: 200,
                headers: {
                    "Content-Type": "image/webp",
                    "Content-Disposition": `attachment; filename="${originalName}.webp"`,
                },
            });
        } else {
            // Multiple files conversion - create ZIP
            const zip = new JSZip();
            const convertedFiles = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const webpBuffer = await sharp(buffer).webp().toBuffer();
                const originalName = file.name.split('.')[0];
                const fileName = `${originalName}.webp`;

                zip.file(fileName, webpBuffer);
                convertedFiles.push({
                    name: fileName,
                    buffer: webpBuffer,
                    originalName: file.name
                });
            }

            const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

            return new NextResponse(zipBuffer, {
                status: 200,
                headers: {
                    "Content-Type": "application/zip",
                    "Content-Disposition": `attachment; filename="converted-images.zip"`,
                },
            });
        }
    } catch (error) {
        console.error("Conversion error:", error);
        return NextResponse.json({ 
            error: "Failed to convert images", 
            details: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}