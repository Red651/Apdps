window.dashExtensions = Object.assign({}, window.dashExtensions, {
    default: {
        function0: function(feature) {
                return {
                    color: feature.properties.color_value
                };
            }

            ,
        function1: function(feature, layer, context) {
            layer.bindPopup(
                `
            <b>Wilayah Kerja : ${feature.properties.WILAYAH_KE}</b>
            <div class="table-container">
                <table class="attribute_table">
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Label</td>
                        <td>${feature.properties.LABEL}</td>
                    </tr>
                    <tr>
                        <td>Wilayah Kerja</td>
                        <td>${feature.properties.WILAYAH_KE}</td>
                    </tr>
                    <tr>
                        <td>Operator</td>
                        <td>${feature.properties.Operator}</td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td>${feature.properties.STATUS}</td>
                    </tr>
                    <tr>
                        <td>Tanggal Efektif</td>
                        <td>${feature.properties.TGL_EFEKTI}</td>
                    </tr>
                    <tr>
                        <td>Fase</td>
                        <td>${feature.properties.FASE}</td>
                    </tr>
                    <tr>
                        <td>Jenis</td>
                        <td>${feature.properties.JENIS}</td>
                    </tr>
                    <tr>
                        <td>Lokasi</td>
                        <td>${feature.properties.LOKASI}</td>
                    </tr>
                    <tr>
                        <td>KKS</td>
                        <td>${feature.properties.KKS}</td>
                    </tr>
                    <tr>
                        <td>Basin 128</td>
                        <td>${feature.properties.BASIN_128}</td>
                    </tr>
                    <tr>
                        <td>Produksi</td>
                        <td>${feature.properties.PRODUKSI}</td>
                    </tr>
                    <tr>
                        <td>REG</td>
                        <td>${feature.properties.REG}</td>
                    </tr>
                    <tr>
                        <td>Holding</td>
                        <td>${feature.properties.HOLDING}</td>
                    </tr>
                    <tr>
                        <td>Area</td>
                        <td>${feature.properties.AREA}</td>
                    </tr>
                    <tr>
                        <td>Perwakilan</td>
                        <td>${feature.properties.Perwakilan}</td>
                    </tr>
                    <tr>
                        <td>NGI Region</td>
                        <td>${feature.properties.NGI_region}</td>
                    </tr>
                </table>
            </div>
            `, {
                    direction: 'top',
                }
            )
        },
        function2: function(feature, layer, context) {
            layer.bindPopup(
                `
            <b>Lapangan : ${feature.properties.FIELD_NAME}</b>
            <div class="table-container">
                <table class="attribute_table">
                            <tr>
            <td>Field Name</td>
            <td>${feature.properties.FIELD_NAME}</td>
                </tr>
                <tr>
                    <td>Wilayah Kerja</td>
                    <td>${feature.properties.WILAYAH_KE}</td>
                </tr>
                <tr>
                    <td>Basin</td>
                    <td>${feature.properties.BASIN}</td>
                </tr>
                <tr>
                    <td>Formation</td>
                    <td>${feature.properties.FORMATION_}</td>
                </tr>
                <tr>
                    <td>Project</td>
                    <td>${feature.properties.PROJECT_LE}</td>
                </tr>
                <tr>
                    <td>Field ID</td>
                    <td>${feature.properties.FIELD_ID}</td>
                </tr>
                <tr>
                    <td>Keterangan</td>
                    <td>${feature.properties.KETERANGAN || 'N/A'}</td>
                </tr>
                <tr>
                    <td>SHU</td>
                    <td>${feature.properties.SHU || 'N/A'}</td>
                </tr>
                <tr>
                    <td>SHU Area</td>
                    <td>${feature.properties.SHU_AREA || 'N/A'}</td>
                </tr>
                <tr>
                    <td>Provinsi</td>
                    <td>${feature.properties.PROVINSI}</td>
                </tr>
                </table>
            </div>
            `, {
                    direction: 'top',
                }
            )
        }
    }
});