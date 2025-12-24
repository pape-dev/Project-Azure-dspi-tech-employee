<#
.SYNOPSIS
    Script de déploiement Azure Web App Pro (Source : GitHub).
.DESCRIPTION
    Déploiement complet : Monitoring, Sécurité et Synchronisation continue avec GitHub.
#>

# --- 1. CONFIGURATION DES PARAMÈTRES ---
$params = @{
    RGName      = "rg-node-prod-norway"
    Location    = "norwayeast"
    PlanName    = "asp-node-linux-premium"
    AppName     = "webapp-node-$(Get-Random -Minimum 1000 -Maximum 9999)"
    SkuTier     = "Basic"
    SkuSize     = "B1"
    Runtime     = "NODE|20-lts"
    RepoUrl     = "https://github.com/pape-dev/Project-Azure-dspi-tech-employee.git"
    Branch      = "main"
}

$tags = @{
    Environment = "Production"
    Project     = "Project-Azure-dspi"
}

Write-Host "`n🚀 Lancement du déploiement depuis GitHub..." -ForegroundColor Magenta

# --- 2. GROUPE DE RESSOURCES ---
if (!(Get-AzResourceGroup -Name $params.RGName -ErrorAction SilentlyContinue)) {
    New-AzResourceGroup -Name $params.RGName -Location $params.Location -Tag $tags -Force | Out-Null
}

# --- 3. MONITORING (APPLICATION INSIGHTS) ---
Write-Host "[+] Configuration du monitoring..." -ForegroundColor Cyan
$appInsights = New-AzApplicationInsights -ResourceGroupName $params.RGName `
    -Name "$($params.AppName)-insights" -Location $params.Location -Force

# --- 4. PLAN ET WEB APP ---
Write-Host "[+] Création des ressources App Service..." -ForegroundColor Cyan
$plan = New-AzAppServicePlan -Name $params.PlanName -ResourceGroupName $params.RGName `
    -Location $params.Location -Tier $params.SkuTier -NumberofWorkers 1 `
    -WorkerSize "Small" -Linux -ErrorAction Stop

$webApp = New-AzWebApp -Name $params.AppName -ResourceGroupName $params.RGName `
    -Location $params.Location -AppServicePlan $params.PlanName

# --- 5. CONFIGURATION RUNTIME ET SÉCURITÉ ---
Write-Host "[+] Application du runtime et de la sécurité..." -ForegroundColor Cyan
$appSettings = @{
    "NODE_ENV"                              = "production"
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = $appInsights.InstrumentationKey
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = $appInsights.ConnectionString
}

$webApp.SiteConfig.LinuxFxVersion = $params.Runtime
$webApp.HttpsOnly = $true
$webApp.SiteConfig.MinTlsVersion = "1.2"

# On applique la config de base
Set-AzWebApp -WebApp $webApp -AppSettings $appSettings | Out-Null

# --- 6. LIAISON GITHUB (MÉTHODE COMPATIBLE) ---
Write-Host "[+] Liaison avec le dépôt GitHub : $($params.RepoUrl)" -ForegroundColor Cyan
# On utilise le paramètre SourceControl dans Set-AzWebApp
Set-AzWebApp -ResourceGroupName $params.RGName -Name $params.AppName `
    -RepoUrl $params.RepoUrl `
    -Branch $params.Branch `
    -IsManualIntegration $true | Out-Null

# --- 7. RAPPORT FINAL ---
Write-Host "`n" + ("=" * 65) -ForegroundColor Green
Write-Host "             DÉPLOIEMENT GITHUB TERMINÉ" -ForegroundColor Green
Write-Host ("=" * 65) -ForegroundColor Green
Write-Host " 🌍 URL            : https://$($params.AppName).azurewebsites.net" -ForegroundColor Yellow
Write-Host " 📂 Source GitHub  : $($params.RepoUrl)"
Write-Host " 📊 Monitoring     : Application Insights activé"
Write-Host " 📦 Runtime        : $($params.Runtime)"
Write-Host ("=" * 65) -ForegroundColor Green
