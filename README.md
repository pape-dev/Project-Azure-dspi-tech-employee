# 📄 Projet Azure Cloud Computing (Examen E4) : Dossier de Conception Détaillé

## 📅 Contexte et Objectifs

Ce document détaille la conception architecturale et le plan d'action pour le déploiement des ressources Azure, conformément aux exigences de l'examen E4 (Décembre 2025).

### 🎯 Objectifs de l'Examen

| Exigence | Service Cible | Configuration | Note (Max) |
| :--- | :--- | :--- | :--- |
| **1. Hébergement Statique** | VM Windows Server 2025 | Page HTML simple via IIS (Port 80). | 4 |
| **2. Base de Données** | Azure Database for MySQL | Base de données PaaS (`apdb`) pour l'application. | 4 |
| **3. Déploiement Applicatif** | VM Ubuntu Server | Application conteneurisée (Node.js/React) via Docker (Ports 3000, 5000). | 4 |
| **Bonus** | Azure App Service | Déploiement en PaaS de l'application (en parallèle). | 3 |

---

## I. 🗺️ Architecture Générale

L'architecture est une solution hybride IaaS/PaaS, intégrant des composants de mise à l'échelle et de résilience, avec un point d'accès unique via un équilibreur de charge.



### 1.1 Composants Clés

* **Azure Load Balancer (Standard)** : Point d'entrée unique.
* **VNet & Subnet** : Réseau privé pour l'infrastructure IaaS.
* **Deux VMs** : Windows Server (Hébergement Statique) et Ubuntu (Application Docker).
* **Azure Database for MySQL** : Base de données gérée PaaS.
* **Azure Backup** : Solution de continuité dactivité pour les VMs.

---

## II. 🌐 Détail des Services Réseau et Sécurité

| Service | Rôle Principal | Nom / SKU | Configuration Spécifique |
| :--- | :--- | :--- | :--- |
| **VNet** | Réseau Privé Logique | `VNET-Project-Azure` | Préfixe d'Adresse : `10.10.0.0/16` |
| **Subnet** | Réseau des serveurs | `SUBNET-Project-Azure` | Préfixe d'Adresse : `10.10.1.0/24` |
| **Azure Load Balancer** | Distribution du trafic | `LB-Project-Azure` (SKU Standard) | **Pool Backend :** VM Windows et VM Ubuntu. **IP Frontend :** Publique, Statique. |
| **NSG** | Pare-feu de Sous-réseau / NIC | `NSG-Project-Azure` | **Règles Inbound Essentielles (Source : Load Balancer / IP Admin) :** Port 22 (SSH), Port 3389 (RDP), Port 80 (HTTP), Port 3000 (Backend), Port 5000 (Frontend). |

---

## III. 💻 Détail des Ressources de Calcul (VMs)

| Machine Virtuelle | Rôle | Image / SKU | Configuration Applicative |
| :--- | :--- | :--- | :--- |
| **VM-WINDOWS-01** | **Hébergement Statique (Exigence 1)** | Windows Server 2025 Datacenter Gen 2 / `Standard_B2s` | Installation de IIS (Web Server Role). Déploiement du fichier `index.html`. |
| **VM-UBUNTU-01** | **Application Conteneurisée (Exigence 3)** | Ubuntu 22.04 LTS / `Standard_B2s` | Installation de **Docker Engine** via script Bash. Déploiement de l'image Docker (React/Node.js). |

> **Note sur le Load Balancer :** Le trafic HTTP/80 sera dirigé vers le service IIS de la VM Windows, tandis que les ports 3000/5000 seront dirigés vers l'application Docker de la VM Ubuntu, le Load Balancer agissant comme un aiguilleur simple dans ce contexte.

---

## IV. 💾 Détail de la Base de Données et de la Résilience

| Service | Rôle | Configuration | Justification |
| :--- | :--- | :--- | :--- |
| **Azure Database for MySQL** | Base de Données PaaS (Exigence 2) | Nom : `apdb`. Tier : Flexible Server (Recommandé). Version : MySQL 8.0. | Solution PaaS recommandée pour réduire l'overhead d'administration (patching, maintenance). |
| **Sécurité DB** | Connexion sécurisée | Règle de Pare-feu autorisant l'accès depuis le VNet (`10.10.1.0/24`). | Restreindre l'accès à la base de données uniquement aux VMs de l'application. |
| **Azure Backup** | Sauvegarde des VMs (Résilience) | **Recovery Services Vault :** Création et configuration de la politique de sauvegarde. | Assure la continuité des opérations et la capacité de restauration complète des VMs IaaS. |
| **Azure App Service** | Bonus PaaS | Déploiement de l'application Node.js/React. | Démonstration d'une solution PaaS (sans gestion d'OS) pour l'application. |

---

## V. ⚙️ Outils de Déploiement

Le déploiement sera effectué en utilisant une combinaison d'outils standards pour une approche professionnelle :

1.  **Azure CLI (Interface en ligne de commande) :** Utilisé via des **scripts PowerShell** pour l'automatisation du déploiement de l'infrastructure (VNet, NSG, VMs, LB, DB).
2.  **Scripts Bash :** Utilisés via des extensions de VM ou après SSH pour la configuration spécifique de la VM Ubuntu (installation de Docker).
3.  **Commandes RDP/SSH :** Utilisées pour les configurations finales (IIS sur Windows, commande `docker run` sur Ubuntu).

---

## VI. ✅ Prochaines Étapes

1.  **Finalisation des Scripts d'Infrastructure :** Intégration complète des commandes Azure CLI pour créer toutes les ressources listées.
2.  **Script de Nettoyage :** Création d'un script (`cleanup.sh` ou `.ps1`) pour supprimer le groupe de ressources afin d'éviter les frais.
3.  **Tests de Validation :** Vérification de l'accès à la page HTML (Port 80) et à l'application Node.js (Ports 3000/5000) via l'IP Publique du Load Balancer.



---

# Configuration
## Création du groupe de ressources - Vnet - NSG - deux VM linux
```
# =============================================================================
# SCRIPT D'AUTOMATISATION DU DÉPLOIEMENT D'INFRASTRUCTURE AZURE (IaaS)
# Version : 2.0 (Double VM Linux - No Windows)
# =============================================================================

# Connexion (décommentez si nécessaire)
# Connect-AzAccount

# =============================================================================
# 1. DÉFINITION DES VARIABLES GLOBALES
# =============================================================================

# --- Configuration de Base ---
$RESOURCE_GROUP = "Project-Azure"
$LOCATION = "norwayeast"

# --- Configuration Réseau ---
$VNET_NAME = "VNET-Project-Azure"
$VNET_PREFIX = "10.10.0.0/16"
$SUBNET_NAME = "SUBNET-Project-Azure"
$SUBNET_PREFIX = "10.10.1.0/24"

# --- Configuration Sécurité (NSG) ---
$NSG_NAME = "NSG-Project-Azure"

# --- Configuration des Machines Virtuelles (VM Linux uniquement) ---
$VM_LINUX_01 = "VM-UBUNTU-01"
$VM_LINUX_02 = "VM-UBUNTU-02"
$VM_SIZE = "Standard_B2s"
$UBUNTU_IMAGE = "Ubuntu2204"

# --- Informations d'Administration ---
$ADMIN_USER = "dspi"
$ADMIN_PASSWORD = "Azure@2023Hello#"

# =============================================================================
# 2. CRÉATION DU GROUPE DE RESSOURCES ET DU RÉSEAU
# =============================================================================
Write-Host "➡️ Démarrage du déploiement dans la région $LOCATION..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

Write-Host "Création du VNet et Subnet..."
az network vnet create -g $RESOURCE_GROUP -n $VNET_NAME --address-prefix $VNET_PREFIX --location $LOCATION --output none
az network vnet subnet create -g $RESOURCE_GROUP --vnet-name $VNET_NAME --name $SUBNET_NAME --address-prefix $SUBNET_PREFIX --output none

# =============================================================================
# 3. CRÉATION DU NSG ET RÈGLES (SSH, HTTP, HTTPS, NODE)
# =============================================================================
Write-Host "Création du NSG ($NSG_NAME) et des règles Linux..."
az network nsg create -g $RESOURCE_GROUP -n $NSG_NAME --location $LOCATION --output none

# SSH (22)
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-SSH-Inbound --priority 100 --protocol Tcp --destination-port-ranges 22 --access Allow --direction Inbound --output none

# Web (80, 443)
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-HTTP-Inbound --priority 110 --protocol Tcp --destination-port-ranges 80 --access Allow --direction Inbound --output none
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-HTTPS-Inbound --priority 120 --protocol Tcp --destination-port-ranges 443 --access Allow --direction Inbound --output none

# Node.js App (3000, 5000)
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-Node-3000 --priority 140 --protocol Tcp --destination-port-ranges 3000 --access Allow --direction Inbound --output none
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-Node-5000 --priority 150 --protocol Tcp --destination-port-ranges 5000 --access Allow --direction Inbound --output none

# =============================================================================
# 4. CRÉATION DES MACHINES VIRTUELLES LINUX
# =============================================================================

$VMS = @($VM_LINUX_01, $VM_LINUX_02)

foreach ($VM_NAME in $VMS) {
    Write-Host "🚀 Déploiement de la machine : $VM_NAME..."
    az vm create -g $RESOURCE_GROUP -n $VM_NAME `
      --location $LOCATION `
      --image $UBUNTU_IMAGE `
      --size $VM_SIZE `
      --vnet-name $VNET_NAME --subnet $SUBNET_NAME `
      --nsg $NSG_NAME `
      --admin-username $ADMIN_USER `
      --admin-password $ADMIN_PASSWORD `
      --public-ip-sku Standard `
      --output none
}

# =============================================================================
# 5. RÉSUMÉ DES RESSOURCES
# =============================================================================
Write-Host "---"
Write-Host "✅ DÉPLOIEMENT TERMINÉ."
Write-Host "---"

foreach ($VM_NAME in $VMS) {
    $IP = az vm show -g $RESOURCE_GROUP -n $VM_NAME --query "publicIps" -o tsv
    Write-Host "🖥️ $VM_NAME :"
    Write-Host "   - IP Publique : $IP"
    Write-Host "   - Connexion : ssh $ADMIN_USER@$IP"
}
Write-Host "---"
az vm list -g $RESOURCE_GROUP -o table
```
![image](https://hackmd.io/_uploads/BJsLB9-m-l.png)
![image](https://hackmd.io/_uploads/SJ1HH5ZQbe.png)

## Déploiement Azure Database pour MySQL
![image](https://hackmd.io/_uploads/ByVSw9bX-g.png)
![image](https://hackmd.io/_uploads/B1oMYcZ7Wg.png)
## Connexion au server pour la création de la base de données
- MySQL Workbench
![image](https://hackmd.io/_uploads/Sy8Dt5W7Wl.png)
![image](https://hackmd.io/_uploads/rJKjYqZ7bx.png)
![image](https://hackmd.io/_uploads/S1WRYq-mZx.png)
![image](https://hackmd.io/_uploads/H1RAK5b7Zl.png)
![image](https://hackmd.io/_uploads/rybb5qZmZg.png)
- Création de la base de données et les table
```
-- 1. Création de la base de données

CREATE DATABASE IF NOT EXISTS appdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Utiliser la base

USE appdb;

-- 3. Création de la table employees

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  status ENUM('active','inactive','remote') NOT NULL DEFAULT 'active',
  hireDate DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  avatar VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_email (email)
);

-- 4. Création de la table contact

CREATE TABLE IF NOT EXISTS contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

```
![image](https://hackmd.io/_uploads/r1mL9c-m-g.png)
![image](https://hackmd.io/_uploads/rJ8YccWQ-x.png)

- Pare-feu de la base de données

![image](https://hackmd.io/_uploads/HyN8j5b7Wg.png)
## 🐳 Installation Docker (Script Bash)

- Créer un fichier bash et lui donner les autorisations

```
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
```
## 📦 Dépendances applicatives dans chaque VM
```
sudo apt update && sudo apt upgrade -y
# Installation de Node.js (via NodeSource pour avoir une version récente)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
# Installation globale de PM2
sudo npm install -g pm2
```

## Cloner L'application 

### 🔐 Accès GitHub via SSH

Au niveau de chaque VM : 

- 1️⃣ Générer une clé SSH

```
ssh-keygen -t ed25519 -C "pape-dev"

```

- 3️⃣ Copier la clé publique

```
cat ~/.ssh/id_ed25519.pub

```

- 4️⃣ Ajouter la clé sur GitHub : GitHub → Settings → SSH and GPG keys → New SSH key - Colle la clé → Save

- 5️⃣ Cloner le repo en SSH

```
git clone git@github.com:pape-dev/dspi-tech-employee-hub.git

```
### Lancement avec PM2

```
cd ~/dspi-tech-employee-hub
pm2 start server/index.js --name "api-backend"
pm2 save 

```

## Installer les dépendances

```
npm install

```
## Build du projet

```
npm run build

```

## Configuration de Nginx (Reverse Proxy)

```
 nano /etc/nginx/sites-available/mon_app
 
```

code à mettre :

```
server {
    listen 80;
    server_name 4.235.106.204; # Votre IP Azure

    # Serveur de fichiers statiques (Frontend)
    location / {
        root /home/dspi/dspi-tech-employee-hub/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy vers le Backend (Express)
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

```
## Gestion des permissions

```
# Autoriser Nginx à accéder à votre dossier utilisateur
sudo chmod +x /home/dspi

# Donner les droits de lecture sur le projet
sudo chmod -R 755 /home/dspi/dspi-tech-employee-hub

```
## Activation

```
sudo ln -s /etc/nginx/sites-available/mon_app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

```

## Quelques commandes utiles

```
# Voir si le backend est "online"
pm2 status

# Redémarrer le backend
pm2 restart api-backend

# Voir les logs du backend (erreurs de code ou base de données)
pm2 logs api-backend

# Sauvegarder pour le redémarrage automatique de la VM
pm2 save

```

## Statut du pm2

- VM 1
![image](https://hackmd.io/_uploads/S1s94hZmWe.png)

- VM 2
![image](https://hackmd.io/_uploads/H1eRE2Z7Zg.png)


## Se connecter à l'application

- VM 1  : 20.251.223.213
![image](https://hackmd.io/_uploads/rkTeHnbXWx.png)
![image](https://hackmd.io/_uploads/B1jMB2bQbg.png)

- VM 2 : 4.235.106.204
![image](https://hackmd.io/_uploads/HJzqS2-7Wx.png)
![image](https://hackmd.io/_uploads/BkJnS2b7-l.png)

## Vérifier les insertions de la base de données
![image](https://hackmd.io/_uploads/HJ0CBn-7We.png)

# Configuration du load balancer
![image](https://hackmd.io/_uploads/By5JKnZ7Wx.png)
![image](https://hackmd.io/_uploads/BJbNFh-mZx.png)

## Au niveau du code > VM 1 & VM 2 Mettre à jour la configuration du nginx

```
sudo nano /etc/nginx/sites-available/mon_app

```
Les IP "Server_Name" ont été remplacés par "_" : 
![image](https://hackmd.io/_uploads/SyqYbaZQ-x.png)

```
npm run build

sudo systemctl restart nginx

pm2 restart api-backend

```
## Se connecter avec l'IP du Load Balancer 
![image](https://hackmd.io/_uploads/BkYml6-QWe.png)
Le load Balancer affiche L'App de la VM 1 : 
![image](https://hackmd.io/_uploads/B1lyfp-Q-l.png)
On actualise la page il affiche l'App de la VM 2 :
![image](https://hackmd.io/_uploads/SJUempZ7-g.png)
![image](https://hackmd.io/_uploads/Bk5m7pbXbx.png)



---


## ✅ Conclusion
Ce projet valide les compétences suivantes :
- Provisionnement IaaS via scripts automatisés.
- Gestion de services PaaS (MySQL Managé).
- Conteneurisation et Reverse Proxy (Docker / Nginx).
- Haute Disponibilité (Standard Load Balancer).
- Déployer & héberger des applications 
- Sécurisation (Groupes de sécurité et SSH).
