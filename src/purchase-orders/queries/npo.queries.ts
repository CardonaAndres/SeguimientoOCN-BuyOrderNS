export const getAllNpOrders = `
SELECT DISTINCT
    t_docto.f420_id_tipo_docto AS id_tipo_docto,
    t_docto.f420_consec_docto AS consec_docto,
    t_ord_movto.f421_ind_estado AS estado,
    FORMAT(t_docto.f420_fecha, 'dd/MM/yyyy') AS Fecha,
    FORMAT(t_ord_movto.f421_fecha_entrega, 'dd/MM/yyyy') AS FechaEntrega,
    ISNULL(proveedor.f200_id, '') AS CodigoProveedor,
    proveedor.f200_razon_social AS RazonSocial,
    LTRIM(
        REPLACE(
            REPLACE(contacto.f015_email, CHAR(13), ''), 
            CHAR(10), ''
        )
    ) AS EmailProveedor,
    COUNT(*) OVER (PARTITION BY t_docto.f420_rowid) AS TotalItems,
    SUM(CONVERT(INT, t_ord_movto.f421_cant_pedida_base)) OVER (PARTITION BY t_docto.f420_rowid) AS TotalCantidad
FROM Unoee.dbo.t421_cm_oc_movto AS t_ord_movto
INNER JOIN Unoee.dbo.t420_cm_oc_docto AS t_docto 
    ON t_docto.f420_rowid = t_ord_movto.f421_rowid_oc_docto
INNER JOIN Unoee.dbo.t121_mc_items_extensiones 
    ON f121_rowid = t_ord_movto.f421_rowid_item_ext
INNER JOIN Unoee.dbo.t120_mc_items AS items 
    ON f120_rowid = f121_rowid_item
INNER JOIN Unoee.dbo.t054_mm_estados 
    ON f054_id_grupo_clase_docto = f420_id_grupo_clase_docto
   AND f054_id = t_ord_movto.f421_ind_estado
LEFT JOIN Unoee.dbo.t200_mm_terceros AS proveedor 
    ON t_docto.f420_rowid_tercero_prov = proveedor.f200_rowid
LEFT JOIN Unoee.dbo.t125_mc_items_criterios 
    ON f125_rowid_item = f120_rowid 
   AND f125_id_cia = 1
   AND f125_id_plan = '006'
LEFT JOIN Unoee.dbo.t015_mm_contactos AS contacto
    ON contacto.f015_rowid = proveedor.f200_rowid_contacto
WHERE t_docto.f420_id_tipo_docto = 'OCN'
  AND t_ord_movto.f421_ind_estado IN ('1', '2')
  AND t_docto.f420_id_cia = 1
  AND f125_id_criterio_mayor IN ('CNRP', 'CNMP')
`

export const getTotalNpOrders = `
SELECT COUNT(*) AS totalNPO
FROM (
    SELECT DISTINCT
        t_docto.f420_id_tipo_docto AS id_tipo_docto,
        t_docto.f420_consec_docto AS consec_docto,
        t_ord_movto.f421_ind_estado AS estado,
        FORMAT(t_docto.f420_fecha, 'dd/MM/yyyy') AS Fecha,
        FORMAT(t_ord_movto.f421_fecha_entrega, 'dd/MM/yyyy') AS FechaEntrega,
        ISNULL(proveedor.f200_id, '') AS CodigoProveedor,
        proveedor.f200_razon_social AS RazonSocial,
        contacto.f015_email AS EmailProveedor,
        COUNT(*) OVER (PARTITION BY t_docto.f420_rowid) AS TotalItems,
        SUM(CONVERT(INT, t_ord_movto.f421_cant_pedida_base)) OVER (PARTITION BY t_docto.f420_rowid) AS TotalCantidad
    FROM Unoee.dbo.t421_cm_oc_movto t_ord_movto
    INNER JOIN Unoee.dbo.t420_cm_oc_docto t_docto 
        ON t_docto.f420_rowid = t_ord_movto.f421_rowid_oc_docto
    INNER JOIN Unoee.dbo.t121_mc_items_extensiones 
        ON f121_rowid = t_ord_movto.f421_rowid_item_ext
    INNER JOIN Unoee.dbo.t120_mc_items items 
        ON f120_rowid = f121_rowid_item
    INNER JOIN Unoee.dbo.t054_mm_estados 
        ON f054_id_grupo_clase_docto = f420_id_grupo_clase_docto
        AND f054_id = t_ord_movto.f421_ind_estado
    LEFT JOIN Unoee.dbo.t200_mm_terceros proveedor 
        ON t_docto.f420_rowid_tercero_prov = proveedor.f200_rowid
    LEFT JOIN Unoee.dbo.t125_mc_items_criterios 
        ON f125_rowid_item = f120_rowid 
        AND f125_id_cia = 1
        AND f125_id_plan = '006'
    LEFT JOIN Unoee.dbo.t015_mm_contactos contacto
        ON contacto.f015_rowid = proveedor.f200_rowid_contacto
    WHERE 
        t_docto.f420_id_tipo_docto = 'OCN'
        AND t_ord_movto.f421_ind_estado IN ('1', '2')
        AND t_docto.f420_id_cia = 1
        AND f125_id_criterio_mayor IN ('CNRP', 'CNMP')
        /**MORE_WHERE_CLAUSE**/
) AS sub 
`

export const getOrdersItems = `
SELECT 
    f120_rowid AS rowid_item,
    CONVERT(VARCHAR, items.f120_id) AS item,
    items.f120_referencia AS Referencia,
    f120_descripcion AS Descripcion,
    
    t_docto.f420_id_tipo_docto AS id_tipo_docto,
    t_docto.f420_consec_docto AS consec_docto,
    t_ord_movto.f421_ind_estado AS estado,
    FORMAT(t_docto.f420_fecha, 'dd/MM/yyyy') AS Fecha,
    FORMAT(t_ord_movto.f421_fecha_entrega, 'dd/MM/yyyy') AS FechaEntrega,
    
    ISNULL(proveedor.f200_id, '') AS CodigoProveedor,
    proveedor.f200_razon_social AS RazonSocial,
    contacto.f015_email AS EmailProveedor,
    
    f150_id AS CodigoBodega,
    t_ord_movto.f421_precio_unitario AS PrecioUnitario,
    CONVERT(INT, t_ord_movto.f421_cant_pedida_base) AS Cantidad,
    f125_id_criterio_mayor AS CriterioMayor,

    (t_ord_movto.f421_precio_unitario * CONVERT(INT, t_ord_movto.f421_cant_pedida_base)) AS TotalLinea
    
FROM Unoee.dbo.t421_cm_oc_movto t_ord_movto
INNER JOIN Unoee.dbo.t420_cm_oc_docto t_docto 
    ON t_docto.f420_rowid = t_ord_movto.f421_rowid_oc_docto
INNER JOIN Unoee.dbo.t121_mc_items_extensiones 
    ON f121_rowid = t_ord_movto.f421_rowid_item_ext
INNER JOIN Unoee.dbo.t120_mc_items items 
    ON f120_rowid = f121_rowid_item
INNER JOIN Unoee.dbo.t101_mc_unidades_medida t101_movto 
    ON t101_movto.f101_id_cia = t_ord_movto.f421_id_cia
    AND t101_movto.f101_id = t_ord_movto.f421_id_unidad_medida
INNER JOIN Unoee.dbo.t150_mc_bodegas 
    ON f150_rowid = t_ord_movto.f421_rowid_bodega
INNER JOIN Unoee.dbo.t054_mm_estados 
    ON f054_id_grupo_clase_docto = f420_id_grupo_clase_docto
    AND f054_id = t_ord_movto.f421_ind_estado
INNER JOIN Unoee.dbo.t010_mm_companias t_cia 
    ON t_cia.f010_id = '1'
INNER JOIN Unoee.dbo.t100_pp_comerciales 
    ON t_ord_movto.f421_id_cia = f100_id_cia
LEFT JOIN Unoee.dbo.t400_cm_existencia 
    ON f400_rowid_item_ext = f121_rowid
    AND f400_rowid_bodega = f150_rowid
LEFT JOIN Unoee.dbo.t117_mc_extensiones1_detalle 
    ON f117_id_cia = f121_id_cia 
    AND f117_id = f121_id_ext1_detalle
    AND f117_id_extension1 = f121_id_extension1
LEFT JOIN Unoee.dbo.t119_mc_extensiones2_detalle 
    ON f119_id_cia = f121_id_cia 
    AND f119_id = f121_id_ext2_detalle
    AND f119_id_extension2 = f121_id_extension2
LEFT JOIN Unoee.dbo.t421_cm_oc_movto t_solic_movto 
    ON t_solic_movto.f421_rowid = t_ord_movto.f421_rowid_oc_movto
LEFT JOIN Unoee.dbo.t420_cm_oc_docto t_solic 
    ON t_solic.f420_rowid = t_solic_movto.f421_rowid_oc_docto
LEFT JOIN Unoee.dbo.t122_mc_items_unidades t_unidad_movto 
    ON t_unidad_movto.f122_id_cia = t_ord_movto.f421_id_cia 
    AND t_unidad_movto.f122_rowid_item = f120_rowid 
    AND t_unidad_movto.f122_id_unidad = t_ord_movto.f421_id_unidad_medida
LEFT JOIN Unoee.dbo.t122_mc_items_unidades t_unidad_emb 
    ON t_unidad_emb.f122_id_cia = t_ord_movto.f421_id_cia 
    AND t_unidad_emb.f122_rowid_item = f120_rowid 
    AND t_unidad_emb.f122_id_unidad = f100_id_um_embalaje
LEFT JOIN Unoee.dbo.t101_mc_unidades_medida t101_vol 
    ON t101_vol.f101_id_cia = f100_id_cia
    AND t101_vol.f101_id = f100_id_unidad_volumen
LEFT JOIN Unoee.dbo.t101_mc_unidades_medida t101_peso 
    ON t101_peso.f101_id_cia = f100_id_cia
    AND t101_peso.f101_id = f100_id_unidad_peso
LEFT JOIN Unoee.dbo.t200_mm_terceros proveedor 
    ON t_docto.f420_rowid_tercero_prov = proveedor.f200_rowid
LEFT JOIN Unoee.dbo.t125_mc_items_criterios 
    ON f125_rowid_item = f120_rowid 
    AND f125_id_cia = 1
    AND f125_id_plan = '006'
LEFT JOIN Unoee.dbo.t015_mm_contactos contacto
    ON contacto.f015_rowid = proveedor.f200_rowid_contacto
WHERE 
    t_docto.f420_id_tipo_docto = 'OCN'
    AND t_ord_movto.f421_ind_estado IN ('1', '2')
    AND t_docto.f420_id_cia = 1
    AND f125_id_criterio_mayor IN ('CNRP', 'CNMP')
`