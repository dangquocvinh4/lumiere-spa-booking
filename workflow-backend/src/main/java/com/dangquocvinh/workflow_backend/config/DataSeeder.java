package com.dangquocvinh.workflow_backend.config;

import com.dangquocvinh.workflow_backend.catalog.entity.Branch;
import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.BranchRepository;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.entity.WorkingSchedule;
import com.dangquocvinh.workflow_backend.staff.repository.StaffProfileRepository;
import com.dangquocvinh.workflow_backend.staff.repository.WorkingScheduleRepository;
import com.dangquocvinh.workflow_backend.user.entity.Role;
import com.dangquocvinh.workflow_backend.user.entity.RoleName;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.RoleRepository;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@Profile("!prod") // Chỉ chạy ở local/dev
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final SpaServiceRepository serviceRepository;
    private final StaffProfileRepository staffRepository;
    private final WorkingScheduleRepository scheduleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository, UserRepository userRepository,
                      BranchRepository branchRepository, SpaServiceRepository serviceRepository,
                      StaffProfileRepository staffRepository, WorkingScheduleRepository scheduleRepository,
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.serviceRepository = serviceRepository;
        this.staffRepository = staffRepository;
        this.scheduleRepository = scheduleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        System.out.println("Starting Data Seeding...");

        // 1. Seed Roles
        seedRoles();

        // 2. Seed Admin, Receptionist & Customer
        User admin = seedUser("admin@spa.com", "Nguyễn Admin", "0911111111", RoleName.ROLE_ADMIN);
        User receptionist = seedUser("receptionist@spa.com", "Lê Lễ Tân", "0922222222", RoleName.ROLE_RECEPTIONIST);
        User customer = seedUser("customer1@gmail.com", "Phạm Khách 1", "0955555551", RoleName.ROLE_CUSTOMER);
        User staffUser1 = seedUser("staff1@spa.com", "KTV Hoàng Yến", "0944444441", RoleName.ROLE_THERAPIST);
        User staffUser2 = seedUser("staff2@spa.com", "KTV Minh Tú", "0944444442", RoleName.ROLE_THERAPIST);
        User staffUser3 = seedUser("staff3@spa.com", "KTV Phương Trinh", "0944444443", RoleName.ROLE_THERAPIST);
        User staffUser4 = seedUser("staff4@spa.com", "KTV Thanh Hằng", "0944444444", RoleName.ROLE_THERAPIST);

        // 3. Seed Branch
        Branch branch1 = seedBranch("Lumière Spa - Quận 1", "123 Lê Lợi, Quận 1, TP.HCM");
        Branch branch2 = seedBranch("Lumière Spa - Quận 7", "456 Nguyễn Văn Linh, Quận 7, TP.HCM");
        Branch branch3 = seedBranch("Lumière Spa - Quận 2", "789 Thảo Điền, Quận 2, TP.HCM");

        // 4. Seed Spa Services
        SpaService s1 = seedService("Massage Body Thụy Điển", "Liệu pháp massage kinh điển kết hợp tinh dầu thiên nhiên, giúp giảm căng thẳng cơ bắp và lưu thông khí huyết toàn thân.", 350000, 60, "Massage", "https://images.unsplash.com/photo-1544161515-4ae6ce6fe859?q=80&w=2070&auto=format&fit=crop");
        SpaService s2 = seedService("Chăm sóc da mặt chuyên sâu", "Quy trình 12 bước làm sạch, thải độc và cung cấp dưỡng chất Collagen, đem lại làn da sáng mịn và tràn đầy sức sống.", 500000, 90, "Skincare", "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop");
        SpaService s3 = seedService("Gội đầu dưỡng sinh thảo dược", "Kết hợp gội đầu bằng thảo dược tự nhiên với massage bấm huyệt vùng cổ vai gáy, giúp ngủ ngon và giảm stress.", 150000, 45, "Hair", "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2014&auto=format&fit=crop");
        SpaService s4 = seedService("Trị liệu cổ vai gáy chuyên sâu", "Giải phóng triệt để sự căng cứng cơ bắp vùng cổ vai gáy, phù hợp với dân văn phòng ngồi nhiều.", 250000, 45, "Massage", "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2000&auto=format&fit=crop");
        SpaService s5 = seedService("Tắm trắng hoàng gia", "Ứng dụng công nghệ làm trắng an toàn kết hợp bột ngọc trai, mang lại làn da trắng hồng rạng rỡ.", 800000, 120, "Body Care", "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2000&auto=format&fit=crop");
        SpaService s6 = seedService("Triệt lông vĩnh viễn Diode Laser", "Công nghệ triệt lông lạnh, không đau rát, hiệu quả lâu dài và an toàn cho mọi vùng da.", 400000, 30, "Hair Removal", "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2000&auto=format&fit=crop");
        SpaService s7 = seedService("Điều trị mụn chuẩn Y khoa", "Lấy nhân mụn chuẩn y khoa không sưng viêm, kết hợp chiếu tia Plasma lạnh diệt khuẩn.", 450000, 60, "Skincare", "https://images.unsplash.com/photo-1616394584738-bfc61af9bbce?q=80&w=2000&auto=format&fit=crop");
        SpaService s8 = seedService("Massage chân đá nóng", "Thư giãn huyệt đạo lòng bàn chân bằng đá nóng, kích thích tuần hoàn máu, giảm đau mỏi.", 200000, 45, "Massage", "https://images.unsplash.com/photo-1544161513-01f14a428205?q=80&w=2000&auto=format&fit=crop");

        // 5. Seed Staff Profile
        StaffProfile p1 = seedStaff(staffUser1, branch1, "Kỹ thuật viên chính", "Chuyên về Massage Body", Arrays.asList(s1, s3, s4, s8));
        StaffProfile p2 = seedStaff(staffUser2, branch1, "Chuyên gia Skincare", "5 năm kinh nghiệm Laser", Arrays.asList(s2, s3, s5, s6, s7));
        StaffProfile p3 = seedStaff(staffUser3, branch2, "Chuyên viên tư vấn", "Chuyên môn cao", Arrays.asList(s1, s2, s5, s8));
        StaffProfile p4 = seedStaff(staffUser4, branch3, "Kỹ thuật viên Spa", "Thành thạo công nghệ cao", Arrays.asList(s4, s6, s7));

        // 6. Seed Working Schedule
        seedSchedules(p1);
        seedSchedules(p2);
        seedSchedules(p3);
        seedSchedules(p4);

        System.out.println("Data Seeding Completed!");
    }

    private void seedRoles() {
        for (RoleName rn : RoleName.values()) {
            if (roleRepository.findByName(rn).isEmpty()) {
                Role role = new Role();
                role.setName(rn);
                roleRepository.save(role);
            }
        }
    }

    private User seedUser(String email, String name, String phone, RoleName roleName) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("password123"));
            user.setFullName(name);
            user.setPhone(phone);
            Role role = roleRepository.findByName(roleName).orElseThrow();
            user.setRoles(new HashSet<>(Collections.singletonList(role)));
            return userRepository.save(user);
        });
    }

    private Branch seedBranch(String name, String address) {
        return branchRepository.findAll().stream()
                .filter(b -> b.getName().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    Branch b = new Branch();
                    b.setName(name);
                    b.setAddress(address);
                    b.setOpeningTime(LocalTime.of(9, 0));
                    b.setClosingTime(LocalTime.of(21, 0));
                    return branchRepository.save(b);
                });
    }

    private SpaService seedService(String name, String desc, double price, int duration, String category, String img) {
        SpaService existing = serviceRepository.findAll().stream()
                .filter(s -> s.getName().equals(name))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setDescription(desc);
            existing.setPrice(BigDecimal.valueOf(price));
            existing.setDurationMinutes(duration);
            existing.setCategory(category);
            existing.setImageUrl(img);
            return serviceRepository.save(existing);
        } else {
            SpaService s = new SpaService();
            s.setName(name);
            s.setDescription(desc);
            s.setPrice(BigDecimal.valueOf(price));
            s.setDurationMinutes(duration);
            s.setCategory(category);
            s.setImageUrl(img);
            return serviceRepository.save(s);
        }
    }

    private StaffProfile seedStaff(User user, Branch branch, String title, String bio, List<SpaService> services) {
        StaffProfile existing = staffRepository.findByUser(user).orElse(null);
        if (existing != null) {
            existing.setBranchId(branch.getId());
            existing.setTitle(title);
            existing.setBio(bio);
            existing.setServices(new HashSet<>(services));
            return staffRepository.save(existing);
        } else {
            StaffProfile p = new StaffProfile();
            p.setUser(user);
            p.setBranchId(branch.getId());
            p.setTitle(title);
            p.setBio(bio);
            p.setServices(new HashSet<>(services));
            return staffRepository.save(p);
        }
    }

    private void seedSchedules(StaffProfile profile) {
        if (scheduleRepository.findAll().stream().noneMatch(s -> s.getStaffId().equals(profile.getId()))) {
            for (int i = 1; i <= 7; i++) {
                WorkingSchedule s = new WorkingSchedule();
                s.setStaffId(profile.getId());
                s.setDayOfWeek(i);
                s.setStartTime(LocalTime.of(9, 0));
                s.setEndTime(LocalTime.of(20, 0));
                scheduleRepository.save(s);
            }
        }
    }
}
