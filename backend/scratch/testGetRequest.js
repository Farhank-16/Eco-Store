import axios from "axios";

try {
  const res = await axios.get("http://localhost:3000/product/get?categories=6a3276d8731c4e99c70b6981");
  console.log("Status:", res.status);
  console.log("Products Count:", res.data.products?.length);
  if (res.data.products) {
    for (const p of res.data.products) {
      console.log(`- ${p.name} (${p.category ? p.category.name : "None"})`);
    }
  }
} catch (e) {
  console.error("Error calling API:", e.message);
  if (e.response) {
    console.error("Response data:", e.response.data);
  }
}
