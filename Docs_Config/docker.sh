#!/bin/bash

# =============================================================================
# SCRIPT D'INSTALLATION ET DE MISE À JOUR DE DOCKER ENGINE SUR UBUNTU
#
# Ce script exécute les étapes officielles pour désinstaller les anciennes versions,
# configurer le dépôt Docker et installer les dernières versions des paquets.
#
# Auteur : [Votre Nom/Équipe]
# Date : Décembre 2025
# Version : 1.2 (Basé sur les commandes Docker CLI officielles)
# =============================================================================

# --- 1. CONFIGURATION ET FONCTIONS ---
SCRIPT_NAME=$(basename "$0")
LOG_FILE="/var/log/docker_install_official_$(date +%Y%m%d_%H%M%S).log"
DOCKER_USER=$(whoami)

# Fonction pour afficher des messages d'erreur et quitter
function die {
    echo -e "\n🚨 ERREUR: $1" | tee -a "$LOG_FILE" >&2
    echo "Consultez le fichier de log pour plus de détails: $LOG_FILE"
    exit 1
}

# Fonction pour journaliser les actions
function log_action {
    echo "--- $(date +%Y-%m-%d\ %H:%M:%S) --- $1" | tee -a "$LOG_FILE"
    echo "➡️ $1"
}

# Vérification des privilèges
if [ "$EUID" -ne 0 ]; then
    die "Ce script doit être exécuté avec des privilèges root (sudo)."
fi

log_action "Démarrage du processus d'installation/mise à jour de Docker..."

# --- 2. DÉSINSTALLATION DES VERSIONS INCOMPATIBLES/OBSOLÈTES ---
log_action "Désinstallation des paquets Docker/Conteneur non officiels ou anciens..."

# Commande optimisée pour la désinstallation. Elle ne s'arrête pas s'il n'y a rien à supprimer.
dpkg --get-selections | grep -E 'docker.io|docker-compose|docker-compose-v2|docker-doc|podman-docker|containerd|runc' | awk '{print $1}' | xargs -r apt remove -y >> "$LOG_FILE" 2>&1

# Commande pour supprimer les configurations résiduelles (facultatif mais recommandé)
# apt purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >> "$LOG_FILE" 2>&1

# --- 3. PRÉPARATION ET CONFIGURATION DU DÉPÔT DOCKER ---
log_action "Installation des dépendances pour la gestion des dépôts (ca-certificates, curl)..."
apt update >> "$LOG_FILE" 2>&1 || die "Échec de la mise à jour des index APT."
apt install -y ca-certificates curl >> "$LOG_FILE" 2>&1 || die "Échec de l'installation des prérequis."

log_action "Configuration du répertoire GPG et téléchargement de la clé officielle Docker..."
install -m 0755 -d /etc/apt/keyrings >> "$LOG_FILE" 2>&1
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc >> "$LOG_FILE" 2>&1 || die "Échec du téléchargement de la clé GPG Docker."
chmod a+r /etc/apt/keyrings/docker.asc

log_action "Ajout du dépôt Docker Stable aux sources APT (/etc/apt/sources.list.d/docker.sources)..."
# Utilisation de 'tee' pour écrire dans le fichier avec sudo
tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# --- 4. INSTALLATION DE DOCKER ENGINE ---
log_action "Mise à jour des index APT après ajout du dépôt..."
apt update >> "$LOG_FILE" 2>&1 || die "Échec de la mise à jour des index après ajout du dépôt Docker."

log_action "Installation des paquets principaux Docker (docker-ce, cli, buildx, compose)..."
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >> "$LOG_FILE" 2>&1 || die "Échec de l'installation des paquets Docker."

# --- 5. GESTION DU SERVICE ET VÉRIFICATION ---
log_action "Vérification et démarrage du service Docker..."
systemctl start docker >> "$LOG_FILE" 2>&1
systemctl enable docker >> "$LOG_FILE" 2>&1

if systemctl is-active --quiet docker; then
    log_action "✅ Docker Engine est installé et le service est ACTIF."
else
    die "Le service Docker n'a pas pu démarrer. Vérifiez les dépendances."
fi

# Affichage du statut
systemctl status docker | head -n 3 | tee -a "$LOG_FILE"

# --- 6. CONFIGURATION POST-INSTALLATION (Docker sans sudo) ---
log_action "Ajout de l'utilisateur '$DOCKER_USER' au groupe 'docker'..."

# Ajout au groupe 'docker' (l'utilisateur doit se déconnecter/reconnecter)
usermod -aG docker "$DOCKER_USER" >> "$LOG_FILE" 2>&1

log_action "Exécution du test 'hello-world' (cela peut échouer si l'utilisateur n'est pas root/pas encore reconnecté)..."
docker run hello-world >> "$LOG_FILE" 2>&1 || log_action "ATTENTION: Le test 'hello-world' a échoué pour l'utilisateur. Le nouvel utilisateur du groupe 'docker' doit se déconnecter et se reconnecter."

# --- 7. FINALISATION ---
echo ""
echo "=================================================================="
echo "🎉 INSTALLATION DE DOCKER TERMINÉE AVEC SUCCÈS"
echo "=================================================================="
echo "Version de Docker : $(docker --version)"
echo "Utilisateur '$DOCKER_USER' ajouté au groupe 'docker'."
echo ""
echo "ACTION REQUISE : Pour utiliser Docker sans 'sudo', vous devez :"
echo "   1. VOUS DÉCONNECTER (logout)."
echo "   2. VOUS RECONNECTER à votre session."
echo ""
echo "Fichier de journalisation : $LOG_FILE"

exit 0