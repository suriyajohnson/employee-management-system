package com.suriya.employeemanagement;
import com.suriya.employeemanagement.entity.Department;
import com.suriya.employeemanagement.entity.Employee;
import com.suriya.employeemanagement.entity.User;
import com.suriya.employeemanagement.repository.AttendanceRepository;
import com.suriya.employeemanagement.repository.DepartmentRepository;
import com.suriya.employeemanagement.repository.EmployeeRepository;
import com.suriya.employeemanagement.repository.UserRepository;
import java.net.*;
import java.net.http.*;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.datasource.url=jdbc:h2:mem:dashboard-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false"
})
class EmployeeManagementSystemApplicationTests {
    @LocalServerPort int port;
    @Autowired UserRepository users;
    @Autowired EmployeeRepository employees;
    @Autowired DepartmentRepository departments;
    @Autowired AttendanceRepository attendance;
    private HttpClient client() { return HttpClient.newBuilder().cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL)).build(); }
    private HttpResponse<String> call(HttpClient client, String method, String path, String body) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
            .header("Content-Type", "application/json").method(method, HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }
    @Test
    void adminWorkflowsAndAccessControl() throws Exception {
        users.save(new User(9001, "dashboard-test-admin", "test-only-password", "ADMIN", true));
        users.save(new User(9002, "dashboard-test-employee", "test-only-password", "EMPLOYEE", true));
        HttpClient client = client();
        assertEquals(401, call(client, "GET", "/allemployee", "").statusCode());
        assertEquals(302, call(client, "GET", "/admin-dashboard.html", "").statusCode());
        assertEquals("ADMIN", call(client, "POST", "/login", "{\"username\":\"dashboard-test-admin\",\"password\":\"test-only-password\"}").body());
        assertEquals(200, call(client, "GET", "/admin-dashboard.html", "").statusCode());
        assertEquals(200, call(client, "POST", "/api/admin/departments", "{\"name\":\"Engineering\",\"manager\":\"Test Manager\"}").statusCode());
        long department = departments.findAll().getFirst().getId();
        assertEquals(409, call(client, "POST", "/api/admin/departments", "{\"name\":\"engineering\"}").statusCode());
        String payload = """
            {"employeeCode":"TEST-001","name":"Test Employee","email":"test@example.invalid","mobile":"1234567890","designation":"Developer","salary":50000,"status":"ACTIVE","dateOfJoining":"2026-01-01","departmentId":%d}
            """.formatted(department);
        assertEquals(400, call(client, "POST", "/employee", payload.replace("50000", "-1")).statusCode());
        assertEquals(200, call(client, "POST", "/employee", payload).statusCode());
        assertEquals(409, call(client, "POST", "/employee", payload).statusCode());
        int employee = employees.findAll().getFirst().getId();
        assertEquals(409, call(client, "DELETE", "/api/admin/departments/" + department, "").statusCode());
        String attendanceBody = "{\"date\":\"" + LocalDate.now() + "\",\"entries\":[{\"employeeId\":" + employee + ",\"status\":\"PRESENT\"}]}";
        assertEquals(200, call(client, "POST", "/api/admin/attendance", attendanceBody).statusCode());
        assertEquals(200, call(client, "POST", "/api/admin/attendance", attendanceBody.replace("PRESENT", "REMOTE")).statusCode());
        assertEquals(1, attendance.count());
        assertEquals("REMOTE", attendance.findAll().getFirst().getStatus());
        assertEquals(400, call(client, "POST", "/api/admin/attendance", attendanceBody.replace("PRESENT", "INVALID")).statusCode());
        assertEquals(400, call(client, "POST", "/api/admin/attendance", attendanceBody.replace(LocalDate.now().toString(), LocalDate.now().plusDays(1).toString())).statusCode());
        String batch = "{\"date\":\"" + LocalDate.now() + "\",\"entries\":[{\"employeeId\":" + employee + ",\"status\":\"ABSENT\"},{\"employeeId\":-1,\"status\":\"PRESENT\"}]}";
        assertEquals(400, call(client, "POST", "/api/admin/attendance", batch).statusCode());
        assertEquals("REMOTE", attendance.findAll().getFirst().getStatus(), "Invalid batches must roll back");
        assertEquals(200, call(client, "PUT", "/employee", payload.replace("{", "{\"id\":" + employee + ",").replace("ACTIVE", "INACTIVE")).statusCode());
        assertEquals("INACTIVE", employees.findById(employee).orElseThrow().getStatus());
        assertEquals(404, call(client, "PUT", "/employee", payload.replace("{", "{\"id\":-1,")).statusCode());
        assertEquals(200, call(client, "DELETE", "/delete/" + employee, "").statusCode());
        assertEquals(0, attendance.count());
        assertEquals(404, call(client, "DELETE", "/delete/" + employee, "").statusCode());
        assertEquals(200, call(client, "DELETE", "/api/admin/departments/" + department, "").statusCode());
        assertEquals(200, call(client, "POST", "/logout", "").statusCode());
        assertEquals(401, call(client, "GET", "/api/admin/departments", "").statusCode());
        assertEquals("EMPLOYEE", call(client, "POST", "/login", "{\"username\":\"dashboard-test-employee\",\"password\":\"test-only-password\"}").body());
        assertEquals(403, call(client, "GET", "/allemployee", "").statusCode());
        assertEquals("Invalid Password", call(client, "POST", "/login", "{\"username\":\"dashboard-test-admin\",\"password\":\"wrong\"}").body());
        assertEquals(401, call(client, "GET", "/allemployee", "").statusCode());
        if (Boolean.getBoolean("uiTest")) {
            seedPreview();
            Process process = new ProcessBuilder("node", "scripts/dashboard-ui-test.cjs", Integer.toString(port)).redirectErrorStream(true).start();
            String browserOutput = new String(process.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            System.out.println(browserOutput);
            assertEquals(0, process.waitFor(), "Browser interaction tests failed: " + browserOutput);
        }
    }
    private void seedPreview() {
        String[] teams = {"Engineering", "Design", "People & Culture", "Marketing"};
        for (String team : teams) {
            Department d = new Department(); d.setName(team); d.setManager("Team lead"); d.setDescription("Building a thoughtful employee experience together."); departments.save(d);
        }
        List<Department> teamsList = departments.findAll();
        String[] names = {"Aarav Sharma", "Diya Patel", "Aditya Kumar", "Ananya Rao", "Rohan Mehta", "Ishita Singh", "Arjun Nair", "Kavya Reddy", "Vikram Joshi", "Meera Iyer", "Rahul Verma", "Neha Kapoor"};
        for (int i = 0; i < names.length; i++) {
            Employee e = new Employee(); e.setEmployeeCode("PD-" + (100+i)); e.setName(names[i]); e.setEmail("person"+i+"@example.invalid");
            e.setDesignation(new String[]{"Software engineer","Product designer","People partner","Marketing specialist"}[i%4]);
            e.setDepartmentId(teamsList.get(i%4).getId()); e.setSalary(45000+i*2500); e.setStatus(i==10?"INACTIVE":"ACTIVE");
            e.setDateOfJoining(LocalDate.now().minusMonths(i%6).withDayOfMonth(1)); employees.save(e);
        }
    }
}
