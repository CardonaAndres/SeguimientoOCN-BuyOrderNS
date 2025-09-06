export const getAllSuppliers = `
SELECT DISTINCT
       proveedor.f200_razon_social AS RazonSocial,
       cto.f015_email AS EmailsString
FROM   t421_cm_oc_movto t_ord_movto
INNER JOIN t420_cm_oc_docto t_docto
       ON t_docto.f420_rowid = t_ord_movto.f421_rowid_oc_docto
INNER JOIN t121_mc_items_extensiones t_ext
       ON t_ext.f121_rowid = t_ord_movto.f421_rowid_item_ext
INNER JOIN t120_mc_items items
       ON items.f120_rowid = t_ext.f121_rowid_item
INNER JOIN t101_mc_unidades_medida t101_movto
       ON t101_movto.f101_id_cia = t_ord_movto.f421_id_cia
      AND t101_movto.f101_id = t_ord_movto.f421_id_unidad_medida
INNER JOIN t150_mc_bodegas bodega
       ON bodega.f150_rowid = t_ord_movto.f421_rowid_bodega
INNER JOIN t054_mm_estados estados
       ON estados.f054_id_grupo_clase_docto = t_docto.f420_id_grupo_clase_docto
      AND estados.f054_id = t_ord_movto.f421_ind_estado
INNER JOIN t010_mm_companias t_cia
       ON t_cia.f010_id = '1'
INNER JOIN t100_pp_comerciales comerc
       ON t_ord_movto.f421_id_cia = comerc.f100_id_cia
 
LEFT JOIN t400_cm_existencia exist
       ON exist.f400_rowid_item_ext = t_ext.f121_rowid
      AND exist.f400_rowid_bodega = bodega.f150_rowid
LEFT JOIN t117_mc_extensiones1_detalle ext1
       ON ext1.f117_id_cia = t_ext.f121_id_cia
      AND ext1.f117_id = t_ext.f121_id_ext1_detalle
      AND ext1.f117_id_extension1 = t_ext.f121_id_extension1
LEFT JOIN t119_mc_extensiones2_detalle ext2
       ON ext2.f119_id_cia = t_ext.f121_id_cia
      AND ext2.f119_id = t_ext.f121_id_ext2_detalle
      AND ext2.f119_id_extension2 = t_ext.f121_id_extension2
LEFT JOIN t421_cm_oc_movto t_solic_movto
       ON t_solic_movto.f421_rowid = t_ord_movto.f421_rowid_oc_movto
LEFT JOIN t420_cm_oc_docto t_solic
       ON t_solic.f420_rowid = t_solic_movto.f421_rowid_oc_docto
LEFT JOIN t122_mc_items_unidades t_unidad_movto
       ON t_unidad_movto.f122_id_cia = t_ord_movto.f421_id_cia
      AND t_unidad_movto.f122_rowid_item = items.f120_rowid
      AND t_unidad_movto.f122_id_unidad = t_ord_movto.f421_id_unidad_medida
LEFT JOIN t122_mc_items_unidades t_unidad_emb
       ON t_unidad_emb.f122_id_cia = t_ord_movto.f421_id_cia
      AND t_unidad_emb.f122_rowid_item = items.f120_rowid
      AND t_unidad_emb.f122_id_unidad = comerc.f100_id_um_embalaje
LEFT JOIN t101_mc_unidades_medida t101_vol
       ON t101_vol.f101_id_cia = comerc.f100_id_cia
      AND t101_vol.f101_id = comerc.f100_id_unidad_volumen
LEFT JOIN t101_mc_unidades_medida t101_peso
       ON t101_peso.f101_id_cia = comerc.f100_id_cia
      AND t101_peso.f101_id = comerc.f100_id_unidad_peso
LEFT JOIN t200_mm_terceros proveedor
       ON t_docto.f420_rowid_tercero_prov = proveedor.f200_rowid
LEFT JOIN t125_mc_items_criterios crit
       ON crit.f125_rowid_item = items.f120_rowid
      AND crit.f125_id_cia = 1
      AND crit.f125_id_plan = '006'
LEFT JOIN t015_mm_contactos cto
       ON cto.f015_rowid = proveedor.f200_rowid_contacto
 
WHERE  t_docto.f420_id_tipo_docto = 'OCN'
  AND  t_ord_movto.f421_ind_estado IN ('1','2')
  AND  t_docto.f420_id_cia = 1
  AND  crit.f125_id_criterio_mayor IN ('CNRP','CNMP')
`