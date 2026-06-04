async function run() {
  console.log("Fetching local backend endpoint using global fetch...");
  try {
    const res = await fetch('http://localhost:5000/api/videos/external/youtube/music-categories');
    console.log("Response status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("Success! Data categories found:", data.map(c => c.category));
      console.log("Number of videos per category:", data.map(c => c.videos?.length));
    } else {
      const text = await res.text();
      console.log("Error body:", text);
    }
  } catch (err) {
    console.error("Fetch failed with error:", err.message);
  }
}

run();
