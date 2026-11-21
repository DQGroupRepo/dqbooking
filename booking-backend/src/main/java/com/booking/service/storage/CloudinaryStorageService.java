package com.booking.service.storage;

import com.cloudinary.*;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Profile("prod")
@RequiredArgsConstructor
public class CloudinaryStorageService implements StorageService {

    private final Cloudinary cloudinary;
    private static final Logger log =
            LoggerFactory.getLogger(CloudinaryStorageService.class);

    @Value("${app.upload.path}")
    private String uploadPath;

    @Override
    public List<String> upload(

            List<MultipartFile> files,
            String folder
    ) {
        List<String> uploadedUrls =
                new ArrayList<>();
        // Set your Cloudinary credentials

        //  Dotenv dotenv = Dotenv.load();
        Cloudinary cloudinary = new Cloudinary(uploadPath);
        System.out.println(cloudinary.config.cloudName);

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String contentType = file.getContentType();

            if (contentType == null) {
                log.error("Unknown file type");
            }
            if (contentType.startsWith("image/")) {
                uploadedUrls.add(uploadImages(file));
            } else if (contentType.startsWith("video/")) {
                uploadedUrls.add(uploadVideo(file));
            } else if ("application/pdf".equalsIgnoreCase(contentType)) {
                uploadedUrls.add(uploadRaw(file));
            } else {
                log.error("Invalid file type. Please upload an image, PDF or video.");
            }
        }
        return uploadedUrls;
    }

    private String uploadVideo(MultipartFile file) {
        String secureUrl = null;
        Map params1 = ObjectUtils.asMap("resource_type", "video",
                "use_filename", true,
                "unique_filename", true,
                "overwrite", true );
        try {
            Map<?, ?> response = cloudinary.uploader().upload(file.getBytes(),params1
                    /*ObjectUtils.asMap("resource_type", "video",
                            "public_id", "dog_closeup",
                            "eager", Arrays.asList(
                                    new EagerTransformation().width(300).height(300).crop("pad").audioCodec("none"),
                                    new EagerTransformation().width(160).height(100).crop("crop").gravity("south").audioCodec("none")),
                            "eager_async", true,
                            "eager_notification_url", "https://mysite.example.com/notify_endpoint")*/);
            secureUrl = response
                    .get("secure_url")
                    .toString();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return secureUrl;
    }

    private String uploadRaw(MultipartFile file) {
        try {
            Map<?, ?> response = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "raw", "use_filename", true, "unique_filename", true, "overwrite", false));
            return response.get("secure_url").toString();
        } catch (IOException ex) {
            throw new RuntimeException("Unable to upload document: " + file.getOriginalFilename(), ex);
        }
    }

    private String uploadImages(MultipartFile file){

        String secureUrl = null;
        Map params1 = ObjectUtils.asMap(
                "use_filename", true,
                "unique_filename", true,
                "overwrite", true );
        try {
            Map<?, ?> response =
                    cloudinary.uploader().upload(
                            file.getBytes(),params1);
            secureUrl = response
                    .get("secure_url")
                    .toString();

        }
        catch (IOException ex) {
            throw new RuntimeException(
                    "Unable to upload file: "
                            + file.getOriginalFilename(),
                    ex);
        }

        return secureUrl;
    }


    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            URI uri = URI.create(fileUrl);
            String path = uri.getPath();
            int uploadIndex = path.indexOf("/upload/");
            if (uploadIndex < 0) {
                log.warn("Skipping Cloudinary delete for a URL that is not an upload URL");
                return;
            }
            String resourceType = path.substring(0, uploadIndex).contains("/raw") ? "raw" : "image";
            String publicId = path.substring(uploadIndex + "/upload/".length());
            publicId = publicId.replaceFirst("^v\\d+/", "");
            if (resourceType.equals("image")) {
                int extension = publicId.lastIndexOf('.');
                if (extension > publicId.lastIndexOf('/')) publicId = publicId.substring(0, extension);
            }
            if (publicId.isBlank()) return;
            Map<?, ?> result = cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", resourceType, "invalidate", true));
            log.info("Cloudinary asset deletion requested resourceType={} result={}", resourceType, result.get("result"));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to delete the uploaded file from Cloudinary.", ex);
        }
    }

}