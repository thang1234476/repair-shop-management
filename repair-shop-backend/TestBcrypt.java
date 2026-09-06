import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBcrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        boolean matches = encoder.matches("Password123!", "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdmzSBLLO");
        System.out.println("Matches: " + matches);
    }
}
