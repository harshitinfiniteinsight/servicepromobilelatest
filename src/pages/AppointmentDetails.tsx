import { useParams, useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockAppointments, mockCustomers, mockEmployees } from "@/data/mobileMockData";
import { Calendar, Clock, User } from "lucide-react";

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const appointment = mockAppointments.find((a) => a.id === id);

  if (!appointment) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <MobileHeader title="Appointment Details" showBack={true} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center pt-14">
          <p className="text-lg font-semibold text-gray-800">Item not found</p>
          <p className="text-sm text-gray-500">This appointment could not be found in demo data.</p>
          <Button onClick={() => navigate("/appointments/manage")}>Back to Appointments</Button>
        </div>
      </div>
    );
  }

  const customer = mockCustomers.find((c) => c.id === appointment.customerId);
  const technician = mockEmployees.find((e) => e.id === appointment.technicianId);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Appointment Details" showBack={true} />

      <div className="flex-1 overflow-y-auto scrollable pt-14 pb-6">
        <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{appointment.id}</h2>
              <Badge variant="outline">{appointment.status}</Badge>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3">Service</h3>
            <p className="text-sm text-gray-800">{appointment.service}</p>
          </div>

          <div className="p-4 rounded-xl border bg-card space-y-2">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Schedule
            </h3>
            <p className="text-sm"><span className="text-muted-foreground">Date:</span> {new Date(appointment.date).toLocaleDateString()}</p>
            <p className="text-sm"><span className="text-muted-foreground">Time:</span> {appointment.time}</p>
            <p className="text-sm"><span className="text-muted-foreground">Duration:</span> {appointment.duration}</p>
          </div>

          <div className="p-4 rounded-xl border bg-card space-y-2">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              People
            </h3>
            <p className="text-sm"><span className="text-muted-foreground">Customer:</span> {appointment.customerName}</p>
            <p className="text-sm"><span className="text-muted-foreground">Technician:</span> {appointment.technicianName}</p>
            {customer?.phone && <p className="text-sm"><span className="text-muted-foreground">Customer Phone:</span> {customer.phone}</p>}
            {technician?.phone && <p className="text-sm"><span className="text-muted-foreground">Technician Phone:</span> {technician.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => navigate("/appointments/manage")}>View Calendar</Button>
            <Button className="gap-2" onClick={() => navigate(`/appointments/${appointment.id}/edit`)}>
              <Clock className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
