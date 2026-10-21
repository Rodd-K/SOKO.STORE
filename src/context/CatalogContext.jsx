import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase, isConfigured } from "../lib/supabase";

const CatalogContext = createContext(null);

// Database columns are snake_case; the components use camelCase.
function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    originalPrice: row.original_price,
    stock: row.stock,
    rating: Number(row.rating),
    image: row.image,
    description: row.description,
    isNew: row.is_new,
  };
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isConfigured) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }
    const [prod, cat] = await Promise.all([
      supabase.from("products").select("*").order("id", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (prod.error || cat.error) {
      setError((prod.error || cat.error).message);
    } else {
      setError("");
      setProducts(prod.data.map(mapProduct));
      setCategories(cat.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CatalogContext.Provider value={{ products, categories, loading, error, refresh: load }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside a CatalogProvider");
  return ctx;
}
