import { Info } from "lucide-react";

interface PassengerDetailsCardProps {
  fullName: string;
  setFullName: (value: string) => void;
  personalId: string;
  setPersonalId: (value: string) => void;
  selectedSeat: string;
  showPassengerDetails: boolean;
  setShowPassengerDetails: (value: boolean) => void;
  errors: { [key: string]: string };
  setErrors: (errors: { [key: string]: string }) => void;
}

export default function PassengerDetailsCard({
  fullName,
  setFullName,
  personalId,
  setPersonalId,
  selectedSeat,
  showPassengerDetails,
  setShowPassengerDetails,
  errors,
  setErrors,
}: PassengerDetailsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Passenger details
      </h2>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-start gap-2">
        <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-800">
          Don't forget to optimize the price by choosing the right passenger
          type
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          className="text-blue-600 font-semibold hover:underline"
          onClick={() => setShowPassengerDetails(!showPassengerDetails)}
        >
          Adult
        </button>
        <button
          className="text-blue-600 text-sm font-medium hover:underline"
          onClick={() => setShowPassengerDetails(!showPassengerDetails)}
        >
          {showPassengerDetails ? "See less" : "See more"}
        </button>
      </div>

      {showPassengerDetails && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <div className="relative">
                <input
                  type="text"
                  value={`Coach 1 - Seat ${selectedSeat}`}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900"
                />
                <span className="absolute right-3 top-3 text-xs text-gray-500">
                  Soft seat
                </span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <input
                type="text"
                placeholder="Full name (E.g: NGUYEN VAN A)"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors({ ...errors, fullName: "" });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Personal ID/Citizen ID/Passport ID"
              value={personalId}
              onChange={(e) => {
                setPersonalId(e.target.value);
                if (errors.personalId) {
                  setErrors({ ...errors, personalId: "" });
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.personalId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.personalId && (
              <p className="text-red-500 text-xs mt-1">{errors.personalId}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
