<p align="center">
  <img src="logo.png" width="128" alt="Lydia">
</p>

<h1 align="center">Lydia</h1>

<p align="center">A workstation for Linux that lives at the top of your screen, like a dynamic island.<br>
<a href="https://cattastudios.com.br/lydia-releases/">cattastudios.com.br/lydia-releases</a></p>

This repository is where Lydia is distributed: the packages of every version are on
the **[Releases](https://github.com/berelels/lydia-releases/releases)** page, and `site/`
is the site above.

## Install

Download the package for your system from the [latest release](https://github.com/berelels/lydia-releases/releases/latest). **The `.deb` is the recommended one**: it gets every feature.

| Package | For |
| --- | --- |
| `lydia_<version>_amd64.deb` / `_arm64.deb` (recommended) | Ubuntu 22.04+, Debian 12+, Mint 21+, Pop!_OS, Zorin, elementary |
| `lydia-<version>.x86_64.rpm` / `.aarch64.rpm` | Fedora, openSUSE |
| `Lydia-<version>.AppImage` / `-arm64.AppImage` | Any other distro (Arch, Manjaro...) |
| `Lydia-<version>-x86_64.flatpak` | Any distro with Flatpak |

```bash
sudo apt install ./lydia_<version>_amd64.deb
```

Then open **Lydia** from the apps menu. She checks once a day for a newer release here and says so. Each release has a `SHA256SUMS` file to check the downloads.

## License

Lydia is free for personal use; see [LICENSE](LICENSE). The third-party software it includes is listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
