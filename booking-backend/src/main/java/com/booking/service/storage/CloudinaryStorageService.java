package com.booking.service.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Profile("prod")
@RequiredArgsConstructor
public class CloudinaryStorageService
        implements StorageService {


    private final Cloudinary cloudinary;


    @Override
    public List<String> upload(

            List<MultipartFile> files,

            String folder

    ) {


        List<String> uploadedUrls =

                new ArrayList<>();


        for (MultipartFile file : files) {


            if (file == null || file.isEmpty()) {

                continue;

            }


            try {


                Map<?, ?> response =

                        cloudinary

                                .uploader()

                                .upload(

                                        file.getBytes(),

                                        ObjectUtils.asMap(

                                                "folder",

                                                folder,

                                                "resource_type",

                                                "auto"

                                        )

                                );


                String secureUrl =

                        response

                                .get("secure_url")

                                .toString();


                uploadedUrls.add(

                        secureUrl

                );


            }

            catch (IOException ex) {


                throw new RuntimeException(

                        "Unable to upload file: "

                                + file.getOriginalFilename(),

                        ex

                );

            }

        }


        return uploadedUrls;

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