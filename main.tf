provider "google" {
  version = "3.5.0"

  credentials = file("./creds/LightBikeNode-1548ac937c58.json")

  project = "lightbikenode"
  region  = "us-central1"
  zone    = "us-central1-c"
}

resource "google_compute_instance" "instance" {
  boot_disk {
    initialize_params {
      image = "cos-cloud/cos-stable-72-11316-171-0"
    }
  }
  machine_type = "f1-micro"
  name         = "light-bike-node-server"
  zone         = "us-central1-a"

  network_interface {
    network = "default"

    access_config {
      // Ephemeral IP
    }

  }
  metadata = {
    gce-container-declaration = "spec:\n  containers:\n    - name: instance-4\n      image: 'gcr.io/lightbikenode/light-bike'\n      stdin: false\n      tty: false\n  restartPolicy: Always\n"
    google-logging-enabled    = "true"
  }
  tags = ["http-server", "https-server"]
  labels = {
    "container-vm" : "cos-stable-63-10032-88-0"
  }
  service_account {
    scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring.write",
      "https://www.googleapis.com/auth/servicecontrol",
      "https://www.googleapis.com/auth/service.management.readonly",
      "https://www.googleapis.com/auth/trace.append"
    ]
  }
}

resource "google_compute_firewall" "default" {
 name    = "allow-web-traffic"
 network = "default"

 allow {
   protocol = "tcp"
   ports    = ["80","443"]
 }
}

