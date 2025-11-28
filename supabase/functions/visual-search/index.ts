import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const formData = await req.formData();
    const image = formData.get('image') as File;
    const budget = formData.get('budget') ? JSON.parse(formData.get('budget') as string) : null;

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:${image.type};base64,${base64}`;

    console.log('Analyzing image with Gemini vision...');

    // Use Gemini vision to analyze the image
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and provide a detailed JSON response with the following structure:
{
  "detectedObjects": [
    {
      "label": "object name",
      "confidence": 0.0-1.0,
      "category": "primary category (mobiles/watches/laptops/electronics/fashion/shoes/home/furniture/grocery/tools/beauty/automotive/sports)",
      "description": "brief description"
    }
  ],
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "visualFeatures": {
    "style": "modern/vintage/casual/formal/etc",
    "pattern": "solid/striped/floral/etc",
    "material": "detected material if applicable"
  },
  "searchQueries": ["query1", "query2", "query3"],
  "complementaryCategories": ["category1", "category2"],
  "scene": "indoor/outdoor/product/lifestyle"
}

Be specific and accurate. For products, identify brand if visible. For scenes, detect all relevant objects.`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiData = await response.json();
    const analysisText = aiData.choices[0].message.content;
    const analysis = JSON.parse(analysisText);

    console.log('Image analysis:', analysis);

    // Return enriched analysis with budget info
    return new Response(
      JSON.stringify({
        token: `vs-${Date.now()}`,
        analysis,
        appliedFilters: { budget }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in visual-search:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
