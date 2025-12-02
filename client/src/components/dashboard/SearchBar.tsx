import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import TripSearchBar from "@/components/common/TripSearchBar";

export default function SearchBar() {
  const navigate = useNavigate();

  const handleSearch = (params: {
    from: string;
    to: string;
    date: Dayjs | null;
  }) => {
    // Validate required fields
    if (!params.from || !params.to) {
      alert("Please select both departure and destination locations");
      return;
    }

    // Build search parameters
    const searchParams = new URLSearchParams();

    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
    if (params.date)
      searchParams.set(
        "departureDate",
        dayjs(params.date).format("YYYY-MM-DD"),
      );

    // Navigate to search page with parameters
    navigate(`/search?${searchParams.toString()}`);
  };

  return <TripSearchBar onSearch={handleSearch} />;
}
