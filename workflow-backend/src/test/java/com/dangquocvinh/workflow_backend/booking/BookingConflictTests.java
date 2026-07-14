package com.dangquocvinh.workflow_backend.booking;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import com.dangquocvinh.workflow_backend.booking.service.AvailabilityService;
import com.dangquocvinh.workflow_backend.booking.service.BookingManager;
import com.dangquocvinh.workflow_backend.catalog.entity.Branch;
import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.BranchRepository;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.entity.StaffTimeOff;
import com.dangquocvinh.workflow_backend.staff.entity.WorkingSchedule;
import com.dangquocvinh.workflow_backend.staff.repository.StaffProfileRepository;
import com.dangquocvinh.workflow_backend.staff.repository.StaffTimeOffRepository;
import com.dangquocvinh.workflow_backend.staff.repository.WorkingScheduleRepository;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class BookingConflictTests {

    @Autowired
    private BookingManager bookingManager;

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private StaffProfileRepository staffRepository;

    @Autowired
    private StaffTimeOffRepository timeOffRepository;

    @Autowired
    private WorkingScheduleRepository scheduleRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private SpaServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    private UUID customerId;
    private UUID branchId;
    private UUID staffId;
    private UUID serviceId;
    private LocalDate testDate;

    @BeforeEach
    void setUp() {
        // Clear old data to prevent interference
        appointmentRepository.deleteAll();
        timeOffRepository.deleteAll();
        scheduleRepository.deleteAll();
        staffRepository.deleteAll();
        serviceRepository.deleteAll();
        branchRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Test Branch
        Branch branch = new Branch();
        branch.setName("Test Branch");
        branch.setAddress("123 Test Street");
        branch.setOpeningTime(LocalTime.of(9, 0));
        branch.setClosingTime(LocalTime.of(21, 0));
        branch = branchRepository.save(branch);
        branchId = branch.getId();

        // 2. Create Test Customer User
        User customer = new User();
        customer.setEmail("customer@test.com");
        customer.setPassword("password");
        customer.setFullName("Test Customer");
        customer = userRepository.save(customer);
        customerId = customer.getId();

        // 3. Create Test Staff User
        User staffUser = new User();
        staffUser.setEmail("staff@test.com");
        staffUser.setPassword("password");
        staffUser.setFullName("Test Staff");
        staffUser = userRepository.save(staffUser);

        // 4. Create Test Spa Service
        SpaService service = new SpaService();
        service.setName("Test Facial");
        service.setDescription("Facial description");
        service.setPrice(BigDecimal.valueOf(500000));
        service.setDurationMinutes(60);
        service = serviceRepository.save(service);
        serviceId = service.getId();

        // 5. Create Test Staff Profile
        StaffProfile staff = new StaffProfile();
        staff.setUser(staffUser);
        staff.setBranchId(branchId);
        staff.setTitle("Senior Therapist");
        staff.setBio("Experienced spa therapist");
        staff.setServices(java.util.Set.of(service));
        staff = staffRepository.save(staff);
        staffId = staff.getId();

        // 6. Set Working Schedule (e.g. Wednesday, or dynamic day of week)
        testDate = LocalDate.now().plusDays(2); // Ensure it's a future date
        int dayOfWeekVal = testDate.getDayOfWeek().getValue();

        WorkingSchedule schedule = new WorkingSchedule();
        schedule.setStaffId(staffId);
        schedule.setDayOfWeek(dayOfWeekVal);
        schedule.setStartTime(LocalTime.of(9, 0));
        schedule.setEndTime(LocalTime.of(18, 0));
        scheduleRepository.save(schedule);
    }

    @Test
    void testCancelledAppointmentFreesUpSlot() {
        // Create an appointment from 10:00 to 11:00
        LocalDateTime startAt = testDate.atTime(LocalTime.of(10, 0));
        Appointment app = bookingManager.createAppointment(
                customerId, branchId, staffId, null, List.of(serviceId), startAt, "Immediate check", null
        );

        // Ensure 10:00 slot is NOT available
        List<LocalTime> availableSlotsBefore = availabilityService.findAvailableSlots(List.of(serviceId), branchId, staffId, testDate);
        assertFalse(availableSlotsBefore.contains(LocalTime.of(10, 0)), "Slot 10:00 should be blocked by pending appointment");

        // Cancel the appointment
        bookingManager.updateStatus(app.getId(), AppointmentStatus.CANCELLED);

        // Ensure 10:00 slot is now AVAILABLE again
        List<LocalTime> availableSlotsAfter = availabilityService.findAvailableSlots(List.of(serviceId), branchId, staffId, testDate);
        assertTrue(availableSlotsAfter.contains(LocalTime.of(10, 0)), "Slot 10:00 should be free after cancellation");
    }

    @Test
    void testStaffTimeOffBlocksSlot() {
        // Ensure 14:00 is available initially
        List<LocalTime> availableSlotsBefore = availabilityService.findAvailableSlots(List.of(serviceId), branchId, staffId, testDate);
        assertTrue(availableSlotsBefore.contains(LocalTime.of(14, 0)), "Slot 14:00 should be free initially");

        // Create TimeOff from 14:00 to 16:00
        StaffTimeOff timeOff = new StaffTimeOff();
        timeOff.setStaffId(staffId);
        timeOff.setStartAt(testDate.atTime(LocalTime.of(14, 0)));
        timeOff.setEndAt(testDate.atTime(LocalTime.of(16, 0)));
        timeOff.setReason("Doctor visit");
        timeOffRepository.save(timeOff);

        // Ensure 14:00 is now blocked, but e.g. 16:00 is still available
        List<LocalTime> availableSlotsAfter = availabilityService.findAvailableSlots(List.of(serviceId), branchId, staffId, testDate);
        assertFalse(availableSlotsAfter.contains(LocalTime.of(14, 0)), "Slot 14:00 should be blocked by time-off");
        assertFalse(availableSlotsAfter.contains(LocalTime.of(15, 0)), "Slot 15:00 should be blocked by time-off");
        assertTrue(availableSlotsAfter.contains(LocalTime.of(16, 0)), "Slot 16:00 should be available after time-off ends");
    }

    @Test
    void testConflictingBookingThrowsException() {
        LocalDateTime startAt = testDate.atTime(LocalTime.of(10, 0));
        
        // Book successfully
        bookingManager.createAppointment(
                customerId, branchId, staffId, null, List.of(serviceId), startAt, "First booking", null
        );

        // Try to book overlapping slot (e.g. 10:30) for same staff
        LocalDateTime overlapStart = testDate.atTime(LocalTime.of(10, 30));
        
        Exception exception = assertThrows(RuntimeException.class, () -> {
            bookingManager.createAppointment(
                    customerId, branchId, staffId, null, List.of(serviceId), overlapStart, "Overlapping booking", null
            );
        });

        assertTrue(exception.getMessage().contains("Kỹ thuật viên đã bận"));
    }
}
