package com.example.demo.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Properties;

@Service
public class GmailApiService {

    @Value("${GMAIL_CLIENT_ID}")
    private String clientId;

    @Value("${GMAIL_CLIENT_SECRET}")
    private String clientSecret;

    @Value("${GMAIL_REFRESH_TOKEN}")
    private String refreshToken;

    @Value("${GMAIL_SENDER}")
    private String senderEmail;

    public void sendEmail(String toEmail, String subject, String body) {
        try {
            // Build OAuth2 credential using refresh token
            GoogleCredential credential = new GoogleCredential.Builder()
                    .setTransport(GoogleNetHttpTransport.newTrustedTransport())
                    .setJsonFactory(GsonFactory.getDefaultInstance())
                    .setClientSecrets(clientId, clientSecret)
                    .build()
                    .setRefreshToken(refreshToken);

            // Build Gmail service
            Gmail gmail = new Gmail.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    credential)
                    .setApplicationName("TaskMaster")
                    .build();

            // Build MIME email message
            Session session = Session.getDefaultInstance(new Properties(), null);
            MimeMessage mimeMessage = new MimeMessage(session);
            mimeMessage.setFrom(new InternetAddress(senderEmail));
            mimeMessage.addRecipient(
                    jakarta.mail.Message.RecipientType.TO,
                    new InternetAddress(toEmail)
            );
            mimeMessage.setSubject(subject);
            mimeMessage.setText(body);

            // Encode and send
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            mimeMessage.writeTo(buffer);
            String encodedEmail = Base64.encodeBase64URLSafeString(buffer.toByteArray());

            Message message = new Message();
            message.setRaw(encodedEmail);
            gmail.users().messages().send("me", message).execute();

            System.out.println("Email sent via Gmail API to: " + toEmail);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
