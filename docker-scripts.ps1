# Scripts Docker para FM AutoPass Frontend
# Facilita o uso dos containers Docker

# Definir variáveis
$PROJECT_NAME = "fm-autopass-frontend"
$NETWORK_NAME = "autopass-network"

function Show-Help {
  Write-Host ""
  Write-Host "=== FM AutoPass Frontend - Scripts Docker ===" -ForegroundColor Green
  Write-Host ""
  Write-Host "Comandos disponíveis:" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "  dev           - Iniciar ambiente de desenvolvimento" -ForegroundColor Cyan
  Write-Host "  staging       - Iniciar ambiente de staging" -ForegroundColor Cyan
  Write-Host "  prod          - Iniciar ambiente de produção" -ForegroundColor Cyan
  Write-Host "  build-dev     - Build da imagem de desenvolvimento" -ForegroundColor Cyan
  Write-Host "  build-staging - Build da imagem de staging" -ForegroundColor Cyan
  Write-Host "  build-prod    - Build da imagem de produção" -ForegroundColor Cyan
  Write-Host "  stop          - Parar todos os containers" -ForegroundColor Cyan
  Write-Host "  clean         - Limpar containers e imagens" -ForegroundColor Cyan
  Write-Host "  logs          - Mostrar logs dos containers" -ForegroundColor Cyan
  Write-Host "  shell         - Abrir shell no container de desenvolvimento" -ForegroundColor Cyan
  Write-Host "  help          - Mostrar esta ajuda" -ForegroundColor Cyan
  Write-Host ""
}

# Verificar se Docker está instalado
function Test-Docker {
  try {
    docker --version | Out-Null
    return $true
  }
  catch {
    Write-Host "ERRO: Docker não está instalado ou não está em execução!" -ForegroundColor Red
    return $false
  }
}

# Criar network se não existir
function Initialize-Network {
  $networkExists = docker network ls --filter name=$NETWORK_NAME --format "{{.Name}}" | Select-String $NETWORK_NAME
  if (-not $networkExists) {
    Write-Host "Criando rede Docker: $NETWORK_NAME" -ForegroundColor Yellow
    docker network create $NETWORK_NAME
  }
}

# Função principal
function Invoke-DockerCommand {
  param([string]$Command)
    
  if (-not (Test-Docker)) {
    return
  }

  Initialize-Network

  switch ($Command.ToLower()) {
    "dev" {
      Write-Host "Iniciando ambiente de desenvolvimento..." -ForegroundColor Green
      docker-compose -f docker-compose.dev.yml up --build
    }
        
    "staging" {
      Write-Host "Iniciando ambiente de staging..." -ForegroundColor Green
      docker-compose --profile staging up --build fm-autopass-frontend-staging
    }
        
    "prod" {
      Write-Host "Iniciando ambiente de produção..." -ForegroundColor Green
      docker-compose -f docker-compose.prod.yml up --build
    }
        
    "build-dev" {
      Write-Host "Fazendo build da imagem de desenvolvimento..." -ForegroundColor Green
      docker build --target development -t "$PROJECT_NAME:dev" .
    }
        
    "build-staging" {
      Write-Host "Fazendo build da imagem de staging..." -ForegroundColor Green
      docker build --target production --build-arg BUILD_MODE=staging -t "$PROJECT_NAME:staging" .
    }
        
    "build-prod" {
      Write-Host "Fazendo build da imagem de produção..." -ForegroundColor Green
      docker build --target production --build-arg BUILD_MODE=production -t "$PROJECT_NAME:prod" .
    }
        
    "stop" {
      Write-Host "Parando todos os containers..." -ForegroundColor Yellow
      docker-compose -f docker-compose.yml down
      docker-compose -f docker-compose.dev.yml down
      docker-compose -f docker-compose.prod.yml down
    }
        
    "clean" {
      Write-Host "Limpando containers e imagens..." -ForegroundColor Red
      docker-compose -f docker-compose.yml down --rmi all --volumes --remove-orphans
      docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
      docker-compose -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans
      docker system prune -f
    }
        
    "logs" {
      Write-Host "Mostrando logs dos containers..." -ForegroundColor Cyan
      docker-compose -f docker-compose.dev.yml logs -f 2>$null
      docker-compose -f docker-compose.prod.yml logs -f 2>$null
    }
        
    "shell" {
      Write-Host "Abrindo shell no container de desenvolvimento..." -ForegroundColor Cyan
      docker-compose -f docker-compose.dev.yml exec frontend /bin/sh
    }
        
    "help" {
      Show-Help
    }
        
    default {
      Write-Host "Comando não reconhecido: $Command" -ForegroundColor Red
      Show-Help
    }
  }
}

# Verificar se foi passado um parâmetro
if ($args.Length -eq 0) {
  Show-Help
}
else {
  Invoke-DockerCommand $args[0]
}
