resource "azurerm_managed_redis" "remove_me" {
  name                      = "${local.org}-managed-redis-${local.resource_suffix}"
  resource_group_name       = azurerm_resource_group.primary.name
  location                  = module.primary_region.location
  sku_name                  = "Balanced_B1"
  high_availability_enabled = true

  default_database {
    access_keys_authentication_enabled          = false
    persistence_redis_database_backup_frequency = var.apps_config.managed_redis.rdb_backup_frequency
  }
}
