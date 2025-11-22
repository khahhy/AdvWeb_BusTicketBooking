import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Search } from "lucide-react";
import { DateRangeCalendar } from "@mui/x-date-pickers-pro/DateRangeCalendar";
import { Box, Popover } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";

export default function SearchBar() {
  const navigate = useNavigate();
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(
    null,
  );

  const handleSwap = () => {
    const tempLocation = fromLocation;
    setFromLocation(toLocation);
    setToLocation(tempLocation);
  };

  const handleDateClick = (event: React.MouseEvent<HTMLElement>) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDateClose = () => {
    setDatePickerAnchor(null);
  };

  const handleSearch = () => {
    // Validate required fields
    if (!fromLocation || !toLocation) {
      alert("Please select both departure and destination locations");
      return;
    }

    // Build search parameters
    const searchParams = new URLSearchParams();

    if (fromLocation) searchParams.set("from", fromLocation);
    if (toLocation) searchParams.set("to", toLocation);
    if (dateRange[0])
      searchParams.set(
        "departureDate",
        dayjs(dateRange[0]).format("YYYY-MM-DD"),
      );
    if (dateRange[1])
      searchParams.set("returnDate", dayjs(dateRange[1]).format("YYYY-MM-DD"));

    // Navigate to search page with parameters
    navigate(`/search?${searchParams.toString()}`);
  };

  const formatDateRange = () => {
    if (!dateRange[0] && !dateRange[1]) return "Select dates";
    if (dateRange[0] && !dateRange[1])
      return dayjs(dateRange[0]).format("MMM DD");
    if (dateRange[0] && dateRange[1]) {
      return `${dayjs(dateRange[0]).format("MMM DD")} - ${dayjs(dateRange[1]).format("MMM DD")}`;
    }
    return "Select dates";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 bg-white rounded-full shadow-2xl p-2 border border-gray-200">
        {/* From Field */}
        <div className="flex-1 px-6 py-4">
          <div className="text-xs font-medium text-gray-500 mb-1">From</div>
          <select
            className="w-full text-lg font-medium text-gray-900 border-0 focus:ring-0 focus:outline-none bg-transparent"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
          >
            <option value="">Select departure</option>
            <option value="Ho Chi Minh City">Ho Chi Minh City</option>
            <option value="Hanoi">Hanoi</option>
            <option value="Da Nang">Da Nang</option>
            <option value="Hai Phong">Hai Phong</option>
            <option value="Can Tho">Can Tho</option>
            <option value="Nha Trang">Nha Trang</option>
            <option value="Hue">Hue</option>
          </select>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="flex-shrink-0 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
          type="button"
        >
          <ArrowLeftRight className="w-4 h-4 text-gray-600" />
        </button>

        {/* To Field */}
        <div className="flex-1 px-6 py-4">
          <div className="text-xs font-medium text-gray-500 mb-1">To</div>
          <select
            className="w-full text-lg font-medium text-gray-900 border-0 focus:ring-0 focus:outline-none bg-transparent"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
          >
            <option value="">Select destination</option>
            <option value="Ho Chi Minh City">Ho Chi Minh City</option>
            <option value="Hanoi">Hanoi</option>
            <option value="Da Nang">Da Nang</option>
            <option value="Da Lat">Da Lat</option>
            <option value="Nha Trang">Nha Trang</option>
            <option value="Can Tho">Can Tho</option>
            <option value="Mui Ne">Mui Ne</option>
            <option value="Phu Quoc">Phu Quoc</option>
            <option value="Sapa">Sapa</option>
            <option value="Hue">Hue</option>
            <option value="Hoi An">Hoi An</option>
          </select>
        </div>

        {/* Date Range Picker */}
        <div
          className="flex-1 px-6 py-4 cursor-pointer"
          onClick={handleDateClick}
        >
          <div className="text-xs font-medium text-gray-500 mb-1">Dates</div>
          <div className="text-lg font-medium text-gray-900">
            {formatDateRange()}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="flex-shrink-0 bg-black text-white p-4 rounded-full hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
        >
          <Search className="w-6 h-6" />
        </button>
      </div>

      {/* Date Range Picker Popover */}
      <Popover
        open={Boolean(datePickerAnchor)}
        anchorEl={datePickerAnchor}
        onClose={handleDateClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            mt: 2,
            borderRadius: 2,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <DateRangeCalendar
            value={dateRange}
            onChange={(newValue: [Dayjs | null, Dayjs | null]) =>
              setDateRange(newValue)
            }
            calendars={2}
            sx={{
              "& .MuiPickersCalendarHeader-root": {
                paddingLeft: 2,
                paddingRight: 2,
              },
              "& .MuiDayCalendar-weekDayLabel": {
                color: "#6B7280",
                fontSize: "0.875rem",
                fontWeight: 500,
              },
              "& .MuiPickersDay-root": {
                fontSize: "0.875rem",
                "&:hover": {
                  backgroundColor: "#F3F4F6",
                },
              },
              "& .MuiPickersDay-today": {
                backgroundColor: "#EFF6FF",
                "&:hover": {
                  backgroundColor: "#DBEAFE",
                },
              },
            }}
          />
        </Box>
      </Popover>
    </div>
  );
}
