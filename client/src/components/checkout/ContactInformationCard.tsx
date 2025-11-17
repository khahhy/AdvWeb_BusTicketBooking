import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactInformationCardProps {
  contactName: string;
  setContactName: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  contactPersonalId: string;
  setContactPersonalId: (value: string) => void;
  countryCode: string;
  setCountryCode: (value: string) => void;
  errors: {[key: string]: string};
  setErrors: (errors: {[key: string]: string}) => void;
}

export default function ContactInformationCard({
  contactName,
  setContactName,
  phoneNumber,
  setPhoneNumber,
  email,
  setEmail,
  contactPersonalId,
  setContactPersonalId,
  countryCode,
  setCountryCode,
  errors,
  setErrors,
}: ContactInformationCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Contact information</h2>
      <p className="text-sm text-gray-500 mb-6">
        The system will confirm the booking, refund, or change the schedule through this information
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Full name (E.g: NGUYEN VAN A)"
              value={contactName}
              onChange={(e) => {
                setContactName(e.target.value);
                if (errors.contactName) {
                  setErrors({...errors, contactName: ''});
                }
              }}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 ${
                errors.contactName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {contactName && (
              <button
                onClick={() => setContactName('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {errors.contactName && (
              <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>
            )}
          </div>

          <div className="relative flex gap-2">
            <div className="w-32">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+84">VN +84</SelectItem>
                  <SelectItem value="+1">US +1</SelectItem>
                  <SelectItem value="+44">UK +44</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (errors.phoneNumber) {
                      setErrors({...errors, phoneNumber: ''});
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {phoneNumber && (
                  <button
                    onClick={() => setPhoneNumber('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Email to receive ticket information"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({...errors, email: ''});
                }
              }}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {email && (
              <button
                onClick={() => setEmail('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Personal ID/Citizen ID/Passport ID"
              value={contactPersonalId}
              onChange={(e) => {
                setContactPersonalId(e.target.value);
                if (errors.contactPersonalId) {
                  setErrors({...errors, contactPersonalId: ''});
                }
              }}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 ${
                errors.contactPersonalId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.contactPersonalId && (
              <p className="text-red-500 text-xs mt-1">{errors.contactPersonalId}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
