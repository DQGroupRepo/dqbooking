package com.booking.service.storage;

import com.cloudinary.*;
import com.cloudinary.utils.ObjectUtils;
//import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@Profile("prod")
@RequiredArgsConstructor
public class CloudinaryStorageService
        implements StorageService {

    private final Cloudinary cloudinary;
    private static final Logger log =
            LoggerFactory.getLogger(CloudinaryStorageService.class);

    @Override
    public List<String> upload(

            List<MultipartFile> files,
            String folder
    ) {
        List<String> uploadedUrls =
                new ArrayList<>();
        // Set your Cloudinary credentials

        //  Dotenv dotenv = Dotenv.load();
        Cloudinary cloudinary = new Cloudinary(/*dotenv.get("CLOUDINARY_URL")*/"cloudinary://242688165783559:S7a4OdWt00o-zGCCsH54er05-7Y@zuedzhrj");
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
            } else {
                log.error("Invalid file type. Please upload an image or a video.");
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
    public void delete(

            String imageUrl

    ) {


        // TODO:

        // Implement Cloudinary deletion

        // using public_id when required.

    }

}