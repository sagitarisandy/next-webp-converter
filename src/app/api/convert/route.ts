import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import JSZip from "jszip";

// Configure sharp for serverless environment
if (process.env.NODE_ENV === 'production') {
    sharp.cache(false);
    sharp.simd(false);
}

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

        // Check total file size (max 20MB total)
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (totalSize > maxSize) {
            return NextResponse.json({ 
                error: `Total file size too large. Maximum ${maxSize / 1024 / 1024}MB allowed.` 
            }, { status: 400 });
        }

        // Check if single file or multiple files
        if (files.length === 1) {
            // Single file conversion
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const webpBuffer = await sharp(buffer)
                .webp({ quality: 80, effort: 1 }) // Optimize for speed
                .toBuffer();
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

            // Process files with timeout protection
            const timeout = setTimeout(() => {
                throw new Error('Processing timeout - files too large or too many');
            }, 25000); // 25 seconds timeout

            try {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    const webpBuffer = await sharp(buffer)
                        .webp({ quality: 80, effort: 1 }) // Optimize for speed
                        .toBuffer();
                    const originalName = file.name.split('.')[0];
                    const fileName = `${originalName}.webp`;

                    zip.file(fileName, webpBuffer);
                    convertedFiles.push({
                        name: fileName,
                        buffer: webpBuffer,
                        originalName: file.name
                    });
                }

                clearTimeout(timeout);
            } catch (error) {
                clearTimeout(timeout);
                throw error;
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