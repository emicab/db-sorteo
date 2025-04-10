# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs
    pkgs.openssl
  ];

  # Sets environment variables in the workspace
  env = {
    DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiODZjNjNjOTYtOTViYi00NGYyLWIxYTEtOWZmZTU1Y2QwNWMwIiwidGVuYW50X2lkIjoiOTcyZjg3ZTVkYjYzMTNmMjQzNzM5ZDM4YzI1MDJkM2FkZTQ2NGUyMzA2MmZjNTk0ZmY3MDczYTIxMzIzOWRmYyIsImludGVybmFsX3NlY3JldCI6IjYxNjk2Yjk0LWMzNmQtNDYyOC05ZDZkLWUwNjFkMGUxZmQ2MiJ9.zE6lAqpH9znTGY4-rmXF9kuzM-rX6i8dv-xnylx8-3M";

    PORT="5002";
    
    JWT_SECRET="f14455bd0c2d9469d41f84bdfe0a3e997eff234b049af6513ba2bab6e1275935";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "Prisma.prisma"
    ];

    # Enable previews
    # previews = {
    #   enable = true;
    #   previews = {
    #     web = {
    #       command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
    #       manager = "web";
    #     };
    #   };
    # };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        npm-install = "npm i --no-audit --prefer-offline";
        # init-db = "npx prisma@6.3.0-dev.9 init --db"; # auto-creation of DBs will be enabled soon
        default.openFiles = [ "README.md" ];
      };
      # Runs when the workspace is (re)started
      onStart = {
        setup-instructions = "echo \"Follow the instructions in the README to set up your Prisma Postgres database for this project.\"";
      };
    };
  };
}

