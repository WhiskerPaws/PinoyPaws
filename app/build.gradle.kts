plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.whiskerpaws.pdf"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.whiskerpaws.pdf" // permanent after first Play upload
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        // Google TEST banner unit. Replace with your real AdMob banner unit ID for the Play release.
        buildConfigField("String", "BANNER_ID", "\"ca-app-pub-3940256099942544/6300978111\"")
    }
    buildTypes {
        release { isMinifyEnabled = false }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.09.00")
    implementation(composeBom)
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.5")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.5")
    implementation("androidx.core:core-ktx:1.13.1")

    implementation("com.google.android.gms:play-services-mlkit-document-scanner:16.0.0")
    implementation("com.tom-roush:pdfbox-android:2.0.27.0") // merge / split / compress
    implementation("com.google.android.gms:play-services-ads:23.3.0") // AdMob
}
