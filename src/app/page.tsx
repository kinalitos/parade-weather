import { HomePage } from "@/app/(client)/HomePage";
import { addDays } from "date-fns";

type HomeParams = {
  searchParams: {
    lat?: string;
    long?: string;
    date?: string;
    zoom?: string;
  }
}

export default async function Home({ searchParams }: HomeParams) {
  console.log(await searchParams);

  // obtaining the current location from user's browser
  // @TODO: load current location at the beginning of the app
  const currentLat = 37.7749;
  const currentLong = -122.4194;

  return <HomePage
    lat={Number(searchParams.lat) || currentLat}
    long={Number(searchParams.long) || currentLong}
    zoom={Number(searchParams.zoom) || 13}
    date={new Date(searchParams.date || addDays(new Date(), 1).toISOString())}
  />

}
