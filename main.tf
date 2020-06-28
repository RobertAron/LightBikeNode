provider "google" {
  version = "3.5.0"

  credentials = file("./creds/LightBikeNode-1548ac937c58.json")

  project = "lightbikenode"
  region  = "us-central1"
  zone    = "us-central1-a"
}
provider "google-beta" {

  credentials = file("./creds/LightBikeNode-1548ac937c58.json")

  project = "lightbikenode"
  region  = "us-central1"
  zone    = "us-central1-a"
}

resource "google_compute_instance" "light_bike_server" {
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

# Probably remove this

resource "google_compute_firewall" "default" {
  name    = "allow-web-traffic"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }
}

# LB Stuff

resource "google_compute_instance_group" "instance_group" {
  name      = "light-bike-instance-group"
  instances = [google_compute_instance.light_bike_server.self_link]

  lifecycle {
    create_before_destroy = true
  }

  named_port {
    name = "http"
    port = 80
  }
}

resource "google_compute_http_health_check" "default" {
  name               = "http-health-check"
  request_path       = "/"
  check_interval_sec = 1
  timeout_sec        = 1
}

resource "google_compute_backend_service" "default" {
  name        = "light-bike-backend-service"
  port_name   = "http"
  protocol    = "HTTP"

  backend {
    group = google_compute_instance_group.instance_group.self_link
  }

  health_checks = [google_compute_http_health_check.default.self_link]
}




// This is the actual load balancer
resource "google_compute_url_map" "default" {
  name        = "url-map"
  default_service = google_compute_backend_service.default.id
}

resource "google_compute_global_address" "default" {
  name         = "test-global-address"
  ip_version   = "IPV4"
  address_type = "EXTERNAL"
}
####################################################
#################################################### 
# HTTPS
####################################################
####################################################
resource "google_compute_managed_ssl_certificate" "default" {
  provider = google-beta
  name = "test-cert"
  managed {
    domains = ["light.bike.robertaron.io"]
  }
}

resource "google_compute_target_https_proxy" "target_https" {
  name             = "https-target-proxy"
  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}


// Frontend config
resource "google_compute_global_forwarding_rule" "forward_rule_https" {
  name       = "forward-https-rule"
  target     = google_compute_target_https_proxy.target_https.self_link // connection to the connection to the load balancer
  ip_address = google_compute_global_address.default.address // input ip adress
  port_range = "443"
}

####################################################
#################################################### 
# HTTP
####################################################
####################################################

resource "google_compute_target_http_proxy" "target_http" {
  name             = "https-target-proxy"
  url_map          = google_compute_url_map.default.id
}


// Frontend config
resource "google_compute_global_forwarding_rule" "forward_rule_http" {
  name       = "forward-http-rule"
  target     = google_compute_target_http_proxy.target_http.self_link // connection to the connection to the load balancer
  ip_address = google_compute_global_address.default.address // input ip adress
  port_range = "80"
}