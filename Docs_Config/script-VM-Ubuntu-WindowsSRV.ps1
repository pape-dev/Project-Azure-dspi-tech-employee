# =============================================================================
# SCRIPT D'AUTOMATISATION DU DÉPLOIEMENT D'INFRASTRUCTURE AZURE (IaaS)
#
# Ce script utilise l'interface en ligne de commande (CLI) Azure pour
# déployer un environnement de base composé d'un réseau virtuel, d'un
# groupe de sécurité réseau (NSG) et de deux machines virtuelles (Linux et Windows).
#
# PRÉREQUIS :
# - L'outil Azure CLI (az) doit être installé et authentifié (az login).
Install-Module -Name Az -Scope CurrentUser
Connect-AzAccount
#
# Auteur : Equipe-DSPI-Azure
# Date : Décembre 2025
# Version : 1.0
# =============================================================================

# =============================================================================
# 1. DÉFINITION DES VARIABLES GLOBALES
# Bonnes pratiques : Centraliser la configuration pour une maintenance facile.
# =============================================================================

# --- Configuration de Base ---
$RESOURCE_GROUP = "NET-Project-Azure"  # Nom du groupe de ressources.
$LOCATION = "norwayeast"               # Région Azure.

# --- Configuration Réseau (VNet et Subnet) ---
$VNET_NAME = "VNET-Project-Azure"
$VNET_PREFIX = "10.10.0.0/16"
$SUBNET_NAME = "SUBNET-Project-Azure"
$SUBNET_PREFIX = "10.10.1.0/24"

# --- Configuration Sécurité (NSG) ---
$NSG_NAME = "NSG-Project-Azure"        # Groupe de sécurité réseau appliqué aux deux VMs.

# --- Configuration des Machines Virtuelles (VM) ---
$VM_UBUNTU = "VM-UBUNTU-01"
$VM_WINDOWS = "VM-WINDOWS-01"
$VM_SIZE = "Standard_B2s"
$UBUNTU_IMAGE = "Ubuntu2204"
$WINDOWS_IMAGE = "MicrosoftWindowsServer:WindowsServer:2022-datacenter-azure-edition:latest"

# --- Informations d'Administration (ATTENTION : Non sécurisé pour la production) ---
$ADMIN_USER = "dspi"
$ADMIN_PASSWORD = "Azure@2023Hello#"

# =============================================================================
# 2. CRÉATION DU GROUPE DE RESSOURCES
# Le conteneur logique pour toutes les ressources du projet.
# =============================================================================
Write-Host "➡️ Démarrage du déploiement dans la région $LOCATION..."
Write-Host "Création ou vérification du Resource Group ($RESOURCE_GROUP)..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

# =============================================================================
# 3. CRÉATION DU RÉSEAU VIRTUEL (VNet) ET DU SOUS-RÉSEAU (Subnet)
# =============================================================================
Write-Host "Création du VNet ($VNET_NAME) avec préfixe $VNET_PREFIX..."
az network vnet create -g $RESOURCE_GROUP -n $VNET_NAME `
  --address-prefix $VNET_PREFIX `
  --location $LOCATION --output none

Write-Host "Création du Subnet ($SUBNET_NAME) avec préfixe $SUBNET_PREFIX..."
az network vnet subnet create -g $RESOURCE_GROUP `
  --vnet-name $VNET_NAME `
  --name $SUBNET_NAME `
  --address-prefix $SUBNET_PREFIX --output none

# =============================================================================
# 4. CRÉATION DU GROUPE DE SÉCURITÉ RÉSEAU (NSG) ET DES RÈGLES
# Le NSG contrôle le trafic entrant (Inbound) et sortant (Outbound).
# =============================================================================
Write-Host "Création du NSG ($NSG_NAME)..."
az network nsg create -g $RESOURCE_GROUP -n $NSG_NAME --location $LOCATION --output none

Write-Host "Ajout des règles de base (22, 80, 443, 3389)..."

# Règle pour SSH (Linux) - Priority 100
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME `
  --name Allow-SSH-Inbound --priority 100 --protocol Tcp --destination-port-ranges 22 `
  --access Allow --direction Inbound --output none --description "Accès à distance sécurisé pour Linux."

# Règle pour HTTP - Priority 110
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME `
  --name Allow-HTTP-Inbound --priority 110 --protocol Tcp --destination-port-ranges 80 `
  --access Allow --direction Inbound --output none

# Règle pour HTTPS - Priority 120
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME `
  --name Allow-HTTPS-Inbound --priority 120 --protocol Tcp --destination-port-ranges 443 `
  --access Allow --direction Inbound --output none

# Règle pour RDP (Windows) - Priority 130
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME `
  --name Allow-RDP-Inbound --priority 130 --protocol Tcp --destination-port-ranges 3389 `
  --access Allow --direction Inbound --output none --description "Accès Bureau à distance pour Windows."

# RÈGLES POUR L'APPLICATION NODE.JS ---
Write-Host "Ajout des règles spécifiques pour l'application Node.js (Ports 3000 et 5000)..."

# Règle pour le Backend Node.js (Port 3000) - Priority 140
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME `
  --name Allow-Node-Backend-3000 --priority 140 --protocol Tcp --destination-port-ranges 3000 `
  --access Allow --direction Inbound --output none --description "Accès Backend Node.js (API)."

# Règle pour le Frontend/Application (Port 5000) - Priority 150
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME `
  --name Allow-Node-Frontend-5000 --priority 150 --protocol Tcp --destination-port-ranges 5000 `
  --access Allow --direction Inbound --output none --description "Accès Frontend/Application (Web)."

# =============================================================================
# 5. CRÉATION DES MACHINES VIRTUELLES (VMs)
# Les machines virtuelles sont déployées dans le Subnet et associées au NSG.
# =============================================================================

# --- 5.1 Création de la VM Ubuntu (Linux) ---
Write-Host "Création de la VM Ubuntu ($VM_UBUNTU)..."
az vm create -g $RESOURCE_GROUP -n $VM_UBUNTU `
  --location $LOCATION `
  --image $UBUNTU_IMAGE `
  --size $VM_SIZE `
  --vnet-name $VNET_NAME --subnet $SUBNET_NAME `
  --nsg $NSG_NAME `
  --admin-username $ADMIN_USER `
  --admin-password $ADMIN_PASSWORD `
  --public-ip-sku Standard `
  --output none

# --- 5.2 Création de la VM Windows Server ---
Write-Host "Création de la VM Windows Server ($VM_WINDOWS)..."
az vm create -g $RESOURCE_GROUP -n $VM_WINDOWS `
  --location $LOCATION `
  --image $WINDOWS_IMAGE `
  --size $VM_SIZE `
  --vnet-name $VNET_NAME --subnet $SUBNET_NAME `
  --nsg $NSG_NAME `
  --admin-username $ADMIN_USER `
  --admin-password $ADMIN_PASSWORD `
  --public-ip-sku Standard `
  --output none


# =============================================================================
# 6. RÉSUMÉ DES RESSOURCES CRÉÉES
# Affichage des informations clés pour la connexion post-déploiement.
# =============================================================================
Write-Host "---"
Write-Host "✅ DÉPLOIEMENT TERMINÉ."
Write-Host "Ressources créées dans le groupe $RESOURCE_GROUP dans la région $LOCATION."
Write-Host "---"

# Récupération et affichage des informations d'accès
$UBUNTU_IP = az vm show -g $RESOURCE_GROUP -n $VM_UBUNTU --query "publicIps" -o tsv
Write-Host "🖥️ VM Linux ($VM_UBUNTU) :"
Write-Host "   - IP Publique (SSH/3000/5000) : $UBUNTU_IP"
Write-Host "   - Utilisateur : $ADMIN_USER"

$WINDOWS_IP = az vm show -g $RESOURCE_GROUP -n $VM_WINDOWS --query "publicIps" -o tsv
Write-Host "🖥️ VM Windows ($VM_WINDOWS) :"
Write-Host "   - IP Publique (RDP) : $WINDOWS_IP"
Write-Host "   - Utilisateur : $ADMIN_USER"

Write-Host "---"
Write-Host "Liste complète des Machines Virtuelles (az vm list) :"
az vm list -g $RESOURCE_GROUP -o table
