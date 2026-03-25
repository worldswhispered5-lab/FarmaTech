export async function searchDrugInOpenFDA(query: string, lang: string = "ar"): Promise<string | null> {
  try {
    const isBarcode = /^\d+$/.test(query);
    const searchParam = isBarcode ? `openfda.upc:"${query}"` : `openfda.brand_name:"${query}"+openfda.generic_name:"${query}"`;
    const url = `https://api.fda.gov/drug/label.json?search=${searchParam}&limit=1`;
    
    console.log(`[Shifa Debug] Querying OpenFDA: ${url}`);
    const res = await fetch(url);
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    
    const drug = data.results[0];
    const na = lang === 'en' ? 'N/A' : 'غير متوفر';
    
    const brandName = drug.openfda?.brand_name?.[0] || na;
    const genericName = drug.openfda?.generic_name?.[0] || na;
    const manufacturer = drug.openfda?.manufacturer_name?.[0] || na;
    const warnings = drug.warnings?.[0] || drug.boxed_warning?.[0] || na;
    const purpose = drug.purpose?.[0] || drug.indications_and_usage?.[0] || na;
    const dosage = drug.dosage_and_administration?.[0] || na;
    const activeIngridient = drug.active_ingredient?.[0] || na;

    if (lang === 'en') {
      return `
Found in OpenFDA global database ✅

1- Brand Name: ${brandName}
Generic Name (Active Ingredient): ${genericName} - ${activeIngridient}

____________________________
Manufacturer
${manufacturer}

____________________________
Indications & Usage
${purpose.substring(0, 300)}${purpose.length > 300 ? '...' : ''}

____________________________
Recommended Dosage
${dosage.substring(0, 300)}${dosage.length > 300 ? '...' : ''}

____________________________
Important Warnings
${warnings.substring(0, 300)}${warnings.length > 300 ? '...' : ''}

____________________________
Conclusion: 
This information is provided by the U.S. Food and Drug Administration (FDA). Please always consult a doctor.
      `.trim();
    }

    return `
تم العثور على الدواء في قاعدة بيانات OpenFDA العالمية مجاناً ✅

1- الاسم التجاري: ${brandName}
الاسم العلمي (المادة الفعالة): ${genericName} - ${activeIngridient}

____________________________
الشركة المصنعة
${manufacturer}

____________________________
دواعي الاستعمال
${purpose.substring(0, 300)}${purpose.length > 300 ? '...' : ''}

____________________________
الجرعة الموصى بها
${dosage.substring(0, 300)}${dosage.length > 300 ? '...' : ''}

____________________________
تحذيرات هامة
${warnings.substring(0, 300)}${warnings.length > 300 ? '...' : ''}

____________________________
الخلاصة: 
هذه المعلومات مقدمة من هيئة الغذاء والدواء الأمريكية (FDA). يرجى استشارة الطبيب دائماً.
    `.trim();
  } catch (err) {
    console.error(`[Shifa Error] OpenFDA fetch failed:`, err);
    return null;
  }
}

export async function searchCosmeticInOpenBeauty(query: string, lang: string = "ar"): Promise<string | null> {
  try {
    const isBarcode = /^\d+$/.test(query);
    
    // Open Beauty Facts has different endpoints for barcode vs text search
    let url = "";
    if (isBarcode) {
      url = `https://world.openbeautyfacts.org/api/v0/product/${query}.json`;
    } else {
      url = `https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
    }

    console.log(`[Shifa Debug] Querying Open Beauty Facts: ${url}`);
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    let product = null;

    if (isBarcode) {
      if (data.status !== 1) return null;
      product = data.product;
    } else {
      if (!data.products || data.products.length === 0) return null;
      product = data.products[0];
    }

    if (!product || !product.product_name) return null;

    const na = lang === 'en' ? 'N/A' : 'غير متوفر';
    const productName = product.product_name || na;
    const brand = product.brands || na;
    const ingredients = product.ingredients_text_with_allergens || product.ingredients_text || na;
    const ecoScore = product.ecoscore_grade || na;
    const countries = product.countries || na;

    if (lang === 'en') {
      return `
Product found in Open Beauty Facts database ✅

1- Product Name: ${productName}
Brand: ${brand}
Country/Origin: ${countries}

____________________________
Ingredients
${ingredients.substring(0, 400)}${ingredients.length > 400 ? '...' : ''}

____________________________
Eco-Score / Validity
${ecoScore.toUpperCase() === 'UNKNOWN' ? 'Unknown' : ecoScore.toUpperCase()}

____________________________
Conclusion: 
This is a cosmetic and skincare product, not a medication. Ensure no allergies to the ingredients listed above.
      `.trim();
    }

    return `
تم العثور على المنتج في قاعدة بيانات Open Beauty Facts مجاناً ✅

1- اسم المنتج: ${productName}
العلامة التجارية: ${brand}
بلد التواجد/المنشأ: ${countries}

____________________________
المكونات (Ingredients)
${ingredients.substring(0, 400)}${ingredients.length > 400 ? '...' : ''}

____________________________
درجة الأمان البيئي / الصلاحية (Eco-Score)
${ecoScore.toUpperCase() === 'UNKNOWN' ? 'غير معروف' : ecoScore.toUpperCase()}

____________________________
الخلاصة: 
هذا منتج تجميلي وعناية بالبشرة وليس دواءً. تأكد من عدم وجود حساسية تجاه المكونات المذكورة أعلاه.
    `.trim();
  } catch (err) {
    console.error(`[Shifa Error] Open Beauty Facts fetch failed:`, err);
    return null;
  }
}
