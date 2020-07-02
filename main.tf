provider "google-beta" {

  credentials = file("./creds/LightBikeNode-1548ac937c58.json")

  project = "lightbikenode"
  region  = "us-central1"
  zone    = "us-central1-a"
}

module "auto-single-lb" {
  source = "./modules"
  image  = "gcr.io/lightbikenode/light-bike"
  domain = "light.bike.robertaron.io"
}
