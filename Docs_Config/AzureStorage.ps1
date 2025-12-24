# ==================================================================================
# SCRIPT PRO : DÉPLOIEMENT AZURE STORAGE (RÉGION : NORWAY EAST)
# ==================================================================================

# 1. Configuration des paramètres
$resourceGroup = "MonGroupeRessources"
$location      = "norwayeast"         # Région spécifiée : Norvège Est
$storageName   = "mystorageacct2377"  # Nom unique (minuscules et chiffres uniquement)

Write-Host "--- Début du déploiement en Norvège Est ---" -ForegroundColor Cyan

# 2. Création du Groupe de Ressources
if (!(Get-AzResourceGroup -Name $resourceGroup -ErrorAction SilentlyContinue)) {
    Write-Host "[1/4] Création du groupe de ressources ($resourceGroup)..."
    New-AzResourceGroup -Name $resourceGroup -Location $location | Out-Null
} else {
    Write-Host "[1/4] Le groupe de ressources existe déjà." -ForegroundColor Yellow
}

# 3. Création du Compte de Stockage
$storageAccount = Get-AzStorageAccount -ResourceGroupName $resourceGroup -Name $storageName -ErrorAction SilentlyContinue

if ($null -eq $storageAccount) {
    Write-Host "[2/4] Création du compte de stockage : $storageName..." -ForegroundColor White
    try {
        $storageAccount = New-AzStorageAccount -ResourceGroupName $resourceGroup `
            -Name $storageName `
            -Location $location `
            -SkuName Standard_LRS `
            -Kind StorageV2 `
            -AllowBlobPublicAccess $false `
            -MinimumTlsVersion TLS1_2 -ErrorAction Stop
        
        Write-Host "--- Pause de 45s pour la propagation DNS (Essentiel) ---" -ForegroundColor Yellow
        Start-Sleep -Seconds 45
    } catch {
        Write-Error "Erreur lors de la création du compte : $($_.Exception.Message)"
        return
    }
} else {
    Write-Host "[2/4] Le compte de stockage existe déjà." -ForegroundColor Yellow
}

# Récupération du contexte de sécurité
$ctx = $storageAccount.Context

# 4. Création des services de données (Blob, Files, Tables, Queues)
Write-Host "[3/4] Configuration des services internes..." -ForegroundColor White

# Conteneur Blob (Mode Privé)
New-AzStorageContainer -Name "mon-conteneur-blob" -Context $ctx -Permission Off -ErrorAction SilentlyContinue | Out-Null
Write-Host "      -> Conteneur Blob : OK" -ForegroundColor Green

# Partage de fichiers (File Share)
New-AzStorageShare -Name "partage-pro" -Context $ctx -ErrorAction SilentlyContinue | Out-Null
Write-Host "      -> Partage File Share : OK" -ForegroundColor Green

# Table et File d'attente
New-AzStorageTable -Name "tablelogs" -Context $ctx -ErrorAction SilentlyContinue | Out-Null
New-AzStorageQueue -Name "filemessages" -Context $ctx -ErrorAction SilentlyContinue | Out-Null

# --- RÉSUMÉ ---
Write-Host "`n[4/4] DÉPLOIEMENT TERMINÉ" -ForegroundColor Cyan
Write-Host "----------------------------------------------------"
Write-Host "Région       : $location"
Write-Host "Compte       : $storageName"
Write-Host "Blob URL     : $($storageAccount.PrimaryEndpoints.Blob)"
Write-Host "File URL     : $($storageAccount.PrimaryEndpoints.File)"
