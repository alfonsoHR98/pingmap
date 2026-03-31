export async function getCoords(url: string): Promise<[number, number] | null> {
  try {
    const hostname = new URL(url).hostname;
    const res = await fetch(
      `http://ip-api.com/json/${hostname}?fields=lat,lon,status`,
    );
    const data = await res.json();
    if (data.status !== "success") return null;
    return [data.lat, data.lon];
  } catch {
    return null;
  }
}
