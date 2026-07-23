package com.booking.service.storage;

import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Profile("!prod")
public class LocalStorageService implements StorageService {

    @Value("${app.upload.path}")
    private String uploadPath;

    @Value("${app.upload.base-url}")
    private String baseUrl;


    @Override
    @SneakyThrows
    public List<String> upload(

            List<MultipartFile> files, String folder

    ) {

        Path directory =

                Paths.get(uploadPath);


        Files.createDirectories(directory);


        List<String> uploadedUrls =

                new ArrayList<>();


        for (MultipartFile file : files) {


            if (file == null || file.isEmpty()) {

                continue;

            }


            String extension =

                    StringUtils.getFilenameExtension(

                            file.getOriginalFilename()

                    );


            String fileName =

                    UUID.randomUUID()

                            + (

                            extension != null

                                    ? "." + extension

                                    : ""

                    );


            Path target =

                    directory.resolve(fileName);


            Files.copy(

                    file.getInputStream(),

                    target

            );


            uploadedUrls.add(

                    baseUrl + "/" + fileName

            );

        }


        return uploadedUrls;

    }


    @Override
    @SneakyThrows
    public void delete(

            String imageUrl

    ) {


        String fileName =

                imageUrl.substring(

                        imageUrl.lastIndexOf("/") + 1

                );


        Files.deleteIfExists(

                Paths.get(uploadPath)

                        .resolve(fileName)

        );

    }

}