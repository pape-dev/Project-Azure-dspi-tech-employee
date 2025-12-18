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