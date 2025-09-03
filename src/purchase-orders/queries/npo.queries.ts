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