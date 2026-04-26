import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.formData();
    const image = data.get("image");
    const apiKey = data.get("apiKey") || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    }

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    const prompt = `
      You are an expert culinary translator. 
      Analyze this restaurant menu image and extract the dishes.
      For each dish, provide:
      1. Original name (in the source language)
      2. English translation
      3. A brief, appetizing description in English (what is it? ingredients?)
      4. Estimated price (if visible)
      
      Return the results as a JSON array of objects. 
      Example format:
      [
        {"original": "Phở Bò", "translation": "Beef Noodle Soup", "description": "Traditional Vietnamese soup with rice noodles, tender beef slices, and aromatic herbs in a rich broth.", "price": "65,000 VND"}
      ]
      Only return the JSON array, no other text.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from text (sometimes Gemini wraps it in markdown)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const menuData = JSON.parse(jsonStr);

    return NextResponse.json({ menu: menuData });
  } catch (error) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
