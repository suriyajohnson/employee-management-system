package com.suriya.employeemanagement.repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.suriya.employeemanagement.entity.Attendance;
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByWorkDate(LocalDate date);
    Optional<Attendance> findByEmployeeIdAndWorkDate(Integer id, LocalDate date);
    void deleteByEmployeeId(Integer employeeId);
}
