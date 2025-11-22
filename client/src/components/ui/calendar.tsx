import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Dayjs } from "dayjs";

export interface CalendarProps {
  value?: Dayjs | null;
  onChange?: (date: Dayjs | null) => void;
  className?: string;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disablePast?: boolean;
  disableFuture?: boolean;
}

export function Calendar({
  value,
  onChange,
  className,
  minDate,
  maxDate,
  disablePast,
  disableFuture,
}: CalendarProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        value={value}
        onChange={onChange}
        className={className}
        minDate={minDate}
        maxDate={maxDate}
        disablePast={disablePast}
        disableFuture={disableFuture}
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          padding: 2,
          "& .MuiPickersCalendarHeader-root": {
            color: "black",
            paddingLeft: 2,
            paddingRight: 2,
          },
          "& .MuiDayCalendar-weekDayLabel": {
            color: "black",
            fontWeight: 600,
          },
          "& .MuiPickersDay-root": {
            color: "black",
            "&:hover": {
              backgroundColor: "#f3f4f6",
            },
            "&.Mui-selected": {
              backgroundColor: "black",
              color: "white",
              "&:hover": {
                backgroundColor: "#374151",
              },
            },
          },
          "& .MuiPickersDay-today": {
            backgroundColor: "#e5e7eb",
            border: "none",
            "&:not(.Mui-selected)": {
              backgroundColor: "#e5e7eb",
            },
          },
          "& .MuiIconButton-root": {
            color: "black",
          },
        }}
      />
    </LocalizationProvider>
  );
}
